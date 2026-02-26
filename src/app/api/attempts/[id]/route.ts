import { db } from '@/db';
import { testAttempts, attemptAnswers, ethicsScores, questions, tests, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// GET /api/attempts/[id] — Get detailed attempt result
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Get the attempt with user and test info
        const [attempt] = await db
            .select({
                id: testAttempts.id,
                score: testAttempts.score,
                status: testAttempts.status,
                startedAt: testAttempts.startedAt,
                completedAt: testAttempts.completedAt,
                aiAnalysis: testAttempts.aiAnalysis,
                totalTimeTaken: testAttempts.totalTimeTaken,
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
            .where(eq(testAttempts.id, id));

        if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });

        // Get the answers with question details
        const answers = await db
            .select({
                id: attemptAnswers.id,
                selectedAnswer: attemptAnswers.selectedAnswer,
                isCorrect: attemptAnswers.isCorrect,
                questionText: questions.questionText,
                scenario: questions.scenario,
                options: questions.options,
                correctAnswer: questions.correctAnswer,
                category: questions.category,
                explanation: questions.explanation,
            })
            .from(attemptAnswers)
            .innerJoin(questions, eq(attemptAnswers.questionId, questions.id))
            .where(eq(attemptAnswers.attemptId, id));

        // Get ethics scores
        const [scores] = await db.select().from(ethicsScores).where(eq(ethicsScores.attemptId, id));

        return NextResponse.json({ attempt, answers, ethicsScores: scores });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
