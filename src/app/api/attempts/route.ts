import { db } from '@/db';
import { testAttempts, attemptAnswers, ethicsScores, questions, tests, users } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// GET — List all attempts (admin) or user attempts
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        // Get all attempts with user and test info
        const allAttempts = await db
            .select({
                id: testAttempts.id,
                score: testAttempts.score,
                status: testAttempts.status,
                startedAt: testAttempts.startedAt,
                completedAt: testAttempts.completedAt,
                aiAnalysis: testAttempts.aiAnalysis,
                userName: users.name,
                userEmail: users.email,
                userDept: users.department,
                testTitle: tests.title,
                testCategory: tests.category,
                testId: tests.id,
            })
            .from(testAttempts)
            .innerJoin(users, eq(testAttempts.userId, users.id))
            .innerJoin(tests, eq(testAttempts.testId, tests.id))
            .orderBy(desc(testAttempts.completedAt));

        // If userId provided, filter
        const filtered = userId ? allAttempts.filter(a => a.userEmail === userId || a.userName === userId) : allAttempts;

        return NextResponse.json({ attempts: filtered });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — Submit a test attempt with answers
export async function POST(req: Request) {
    try {
        const { testId, userId, answers, timeTaken } = await req.json();

        // ── Duplicate prevention: reject if user already took this test ──
        const [duplicate] = await db.select({ id: testAttempts.id })
            .from(testAttempts)
            .where(and(eq(testAttempts.userId, userId), eq(testAttempts.testId, testId)));

        if (duplicate) {
            return NextResponse.json({ error: 'You have already taken this test.' }, { status: 409 });
        }

        // Create attempt
        const [attempt] = await db.insert(testAttempts).values({
            userId,
            testId,
            status: 'completed',
            completedAt: new Date(),
            totalTimeTaken: timeTaken || 0,
        }).returning();

        // Fetch the actual questions for this test
        const testQuestions = await db.select().from(questions).where(eq(questions.testId, testId)).orderBy(questions.orderIndex);

        // Score the answers
        let correctCount = 0;
        const categoryScores: Record<string, { correct: number; total: number }> = {};

        for (let i = 0; i < testQuestions.length; i++) {
            const q = testQuestions[i];
            const userAnswer = answers[i]?.selectedAnswer || '';
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) correctCount++;

            // Track by category
            if (!categoryScores[q.category]) categoryScores[q.category] = { correct: 0, total: 0 };
            categoryScores[q.category].total++;
            if (isCorrect) categoryScores[q.category].correct++;

            // Save answer
            await db.insert(attemptAnswers).values({
                attemptId: attempt.id,
                questionId: q.id,
                selectedAnswer: userAnswer,
                isCorrect,
            });
        }

        const overallScore = Math.round((correctCount / testQuestions.length) * 100);

        // Calculate ethics dimension scores
        const dimMap: Record<string, string> = {
            'Integrity': 'integrity',
            'Fairness': 'fairness',
            'Accountability': 'accountability',
            'Transparency': 'transparency',
            'Respect': 'respect',
        };

        const ethicsDims: Record<string, number> = { integrity: 0, fairness: 0, accountability: 0, transparency: 0, respect: 0 };
        for (const [cat, stats] of Object.entries(categoryScores)) {
            const dim = dimMap[cat];
            if (dim) {
                ethicsDims[dim] = Math.round((stats.correct / stats.total) * 100);
            }
        }
        // Fill dims that didn't appear with the overall score
        for (const key of Object.keys(ethicsDims)) {
            if (ethicsDims[key] === 0) ethicsDims[key] = overallScore;
        }

        // Try AI analysis with Groq
        let aiAnalysis: any = null;
        try {
            const aiResponse = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are an ethics evaluation expert. Analyze the test results and return a JSON object with:
- overallScore: number
- categoryScores: {integrity, fairness, accountability, transparency, respect} (0-100 each)
- strengths: array of 3 strings
- improvements: array of 3 strings
- summary: string (2-3 sentences)
- riskLevel: "low" | "medium" | "high"
Return ONLY the JSON, no markdown.`,
                    },
                    {
                        role: 'user',
                        content: `Score: ${overallScore}%, Correct: ${correctCount}/${testQuestions.length}. Category breakdown: ${JSON.stringify(categoryScores)}. Ethics dimensions: ${JSON.stringify(ethicsDims)}.`,
                    },
                ],
                temperature: 0.3,
                max_tokens: 1000,
            });

            const text = aiResponse.choices[0]?.message?.content || '';
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            aiAnalysis = JSON.parse(cleaned);
        } catch {
            // Fallback AI analysis
            aiAnalysis = {
                overallScore,
                categoryScores: ethicsDims,
                strengths: ['Completed the assessment', 'Demonstrated ethical awareness', 'Engaged with scenarios'],
                improvements: ['Review ethical frameworks', 'Practice scenario-based thinking', 'Consider stakeholder perspectives'],
                summary: `Scored ${overallScore}% with ${correctCount} out of ${testQuestions.length} correct.`,
                riskLevel: overallScore >= 80 ? 'low' : overallScore >= 60 ? 'medium' : 'high',
            };
        }

        // Update attempt with score and AI analysis
        await db.update(testAttempts).set({
            score: overallScore,
            aiAnalysis,
        }).where(eq(testAttempts.id, attempt.id));

        // Save ethics scores
        await db.insert(ethicsScores).values({
            userId,
            attemptId: attempt.id,
            ...ethicsDims,
            overallScore,
        });

        return NextResponse.json({ attemptId: attempt.id, score: overallScore });
    } catch (error: any) {
        console.error('Submit attempt error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
