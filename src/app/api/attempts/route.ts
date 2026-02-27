import { db, sqlClient } from '@/db';
import { testAttempts, attemptAnswers, ethicsScores, questions, tests, users } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { randomUUID } from 'crypto';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// GET — List all attempts (only completed ones with scores)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

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
            .where(eq(testAttempts.status, 'completed'))
            .orderBy(desc(testAttempts.completedAt));

        const filtered = userId ? allAttempts.filter(a => a.userEmail === userId || a.userName === userId) : allAttempts;
        return NextResponse.json({ attempts: filtered });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — Submit a test attempt with answers + justifications
export async function POST(req: Request) {
    try {
        const { testId, userId, answers, timeTaken } = await req.json();

        if (!userId || !testId) {
            return NextResponse.json({ error: 'Missing required fields (userId, testId).' }, { status: 400 });
        }

        // Duplicate prevention — allow retry if previous attempt has no score (incomplete)
        const existingAttempts = await db.select({ id: testAttempts.id, score: testAttempts.score })
            .from(testAttempts)
            .where(and(eq(testAttempts.userId, userId), eq(testAttempts.testId, testId)));

        if (existingAttempts.length > 0) {
            const completedWithScore = existingAttempts.find(a => a.score !== null);
            if (completedWithScore) {
                return NextResponse.json({ error: 'You have already taken this test.' }, { status: 409 });
            }
            // Clean up incomplete/failed attempts so user can retry
            for (const a of existingAttempts) {
                await db.delete(attemptAnswers).where(eq(attemptAnswers.attemptId, a.id));
                await db.delete(ethicsScores).where(eq(ethicsScores.attemptId, a.id));
                await db.delete(testAttempts).where(eq(testAttempts.id, a.id));
            }
        }

        // Create attempt as in_progress — only mark completed after full processing
        // Use raw SQL tagged template — Neon HTTP driver handles types correctly this way
        const attemptId = randomUUID();
        const now = new Date().toISOString();
        await sqlClient`
            INSERT INTO test_attempts (id, user_id, test_id, started_at, completed_at, score, status, ai_analysis, total_time_taken)
            VALUES (${attemptId}, ${userId}, ${testId}, ${now}, ${null}, ${null}, ${'in_progress'}, ${null}, ${timeTaken || 0})
        `;
        const attempt = { id: attemptId };

        // Fetch questions
        const testQuestions = await db.select().from(questions).where(eq(questions.testId, testId)).orderBy(questions.orderIndex);

        if (!testQuestions || testQuestions.length === 0) {
            // Clean up the empty attempt
            await db.delete(testAttempts).where(eq(testAttempts.id, attempt.id));
            return NextResponse.json({ error: 'No questions found for this test.' }, { status: 400 });
        }

        // Score answers and build detailed analysis input
        let correctCount = 0;
        const categoryScores: Record<string, { correct: number; total: number }> = {};
        const detailedAnswers: any[] = [];

        for (let i = 0; i < testQuestions.length; i++) {
            const q = testQuestions[i];
            const userAnswer = answers[i]?.selectedAnswer || '';
            const justification = answers[i]?.justification || '';
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) correctCount++;

            if (!categoryScores[q.category]) categoryScores[q.category] = { correct: 0, total: 0 };
            categoryScores[q.category].total++;
            if (isCorrect) categoryScores[q.category].correct++;

            // Get the text of the selected and correct options
            const opts = Array.isArray(q.options) ? q.options : [];
            const selectedOptionText = opts.find((o: any) => o.id === userAnswer)?.text || userAnswer;
            const correctOptionText = opts.find((o: any) => o.id === q.correctAnswer)?.text || q.correctAnswer;

            detailedAnswers.push({
                questionNumber: i + 1,
                question: q.questionText,
                scenario: q.scenario,
                selectedAnswer: userAnswer,
                selectedOptionText,
                correctAnswer: q.correctAnswer,
                correctOptionText,
                isCorrect,
                justification,
                category: q.category,
                explanation: q.explanation,
            });

            // Save answer with justification using raw SQL tagged template
            const answerId = randomUUID();
            const justText = justification && justification.trim() ? justification.trim() : null;
            await sqlClient`
                INSERT INTO attempt_answers (id, attempt_id, question_id, selected_answer, is_correct, justification, time_taken)
                VALUES (${answerId}, ${attempt.id}, ${q.id}, ${userAnswer || ''}, ${isCorrect}, ${justText}, ${null})
            `;
        }

        const overallScore = Math.round((correctCount / testQuestions.length) * 100);

        // Category dimension scores
        const categoryDimScores: Record<string, number> = {};
        for (const [cat, stats] of Object.entries(categoryScores)) {
            categoryDimScores[cat] = Math.round((stats.correct / stats.total) * 100);
        }

        // Ethics dimension scores (for spider chart)
        const dimMap: Record<string, string> = { 'Integrity': 'integrity', 'Fairness': 'fairness', 'Accountability': 'accountability', 'Transparency': 'transparency', 'Respect': 'respect' };
        const ethicsDims: Record<string, number> = { integrity: 0, fairness: 0, accountability: 0, transparency: 0, respect: 0 };
        for (const [cat, stats] of Object.entries(categoryScores)) {
            const dim = dimMap[cat];
            if (dim) ethicsDims[dim] = Math.round((stats.correct / stats.total) * 100);
        }
        for (const key of Object.keys(ethicsDims)) {
            if (ethicsDims[key] === 0) ethicsDims[key] = overallScore;
        }

        // ═══ Personalized AI Analysis — per-question cognitive report ═══
        let aiAnalysis: any = null;
        try {
            const aiResponse = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert assessment analyst. Analyze a test submission with detailed per-question cognitive analysis.

The user selected specific options and may have written justifications explaining their reasoning. Analyze:
1. WHY they chose what they chose (based on their justification and the option selected)
2. What their choice reveals about their thinking patterns
3. Where their reasoning was strong vs where it had gaps

Return ONLY valid JSON with this structure:
{
  "overallScore": number,
  "summary": "2-3 sentence personalized overview of this person's performance and cognitive patterns",
  "strengths": ["3 specific strengths based on their actual answers and reasoning"],
  "improvements": ["3 specific, actionable improvement areas"],
  "cognitiveProfile": "A paragraph describing this person's thinking style, decision-making patterns, and reasoning approach based on their answers and justifications",
  "riskLevel": "low" | "medium" | "high",
  "perQuestionAnalysis": [
    {
      "questionNumber": number,
      "verdict": "correct" | "incorrect" | "partially_understood",
      "feedback": "1-2 sentence personalized feedback about why they chose what they chose and what this reveals",
      "recommendedReading": "optional brief suggestion for improvement"
    }
  ]
}
Return ONLY the JSON. No markdown, no extra text.`,
                    },
                    {
                        role: 'user',
                        content: `Test: "${(await db.select().from(tests).where(eq(tests.id, testId)))[0]?.title}"
Score: ${overallScore}% (${correctCount}/${testQuestions.length})

Detailed Answers:
${detailedAnswers.map(a => `Q${a.questionNumber}: "${a.question}"
  Selected: ${a.selectedAnswer.toUpperCase()} — "${a.selectedOptionText}"
  Correct: ${a.correctAnswer.toUpperCase()} — "${a.correctOptionText}"
  Result: ${a.isCorrect ? 'CORRECT' : 'INCORRECT'}
  User's Justification: "${a.justification || 'No justification provided'}"
  Topic: ${a.category}`).join('\n\n')}`,
                    },
                ],
                temperature: 0.4,
                max_tokens: 4000,
            });

            const text = aiResponse.choices[0]?.message?.content || '';
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            aiAnalysis = JSON.parse(cleaned);
        } catch (err) {
            console.error('AI analysis error:', err);
            aiAnalysis = {
                overallScore,
                summary: `Scored ${overallScore}% with ${correctCount}/${testQuestions.length} correct answers.`,
                strengths: ['Completed the assessment', 'Demonstrated engagement', 'Answered all questions'],
                improvements: ['Review incorrect answers', 'Practice reasoning skills', 'Study key concepts'],
                cognitiveProfile: 'Analysis could not be generated automatically.',
                riskLevel: overallScore >= 80 ? 'low' : overallScore >= 60 ? 'medium' : 'high',
                perQuestionAnalysis: detailedAnswers.map(a => ({
                    questionNumber: a.questionNumber,
                    verdict: a.isCorrect ? 'correct' : 'incorrect',
                    feedback: a.isCorrect ? 'Answered correctly.' : `Selected "${a.selectedOptionText}" instead of "${a.correctOptionText}".`,
                })),
            };
        }

        // Update attempt with score, analysis, and mark as completed
        await db.update(testAttempts).set({
            score: overallScore,
            aiAnalysis,
            status: 'completed',
            completedAt: new Date(),
        }).where(eq(testAttempts.id, attempt.id));

        // Save ethics scores using raw SQL tagged template
        const scoreId = randomUUID();
        const scoreNow = new Date().toISOString();
        await sqlClient`
            INSERT INTO ethics_scores (id, user_id, attempt_id, integrity, fairness, accountability, transparency, respect, overall_score, created_at)
            VALUES (${scoreId}, ${userId}, ${attempt.id}, ${ethicsDims.integrity}, ${ethicsDims.fairness}, ${ethicsDims.accountability}, ${ethicsDims.transparency}, ${ethicsDims.respect}, ${overallScore}, ${scoreNow})
        `;

        return NextResponse.json({ attemptId: attempt.id, score: overallScore });
    } catch (error: any) {
        console.error('Submit attempt error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
