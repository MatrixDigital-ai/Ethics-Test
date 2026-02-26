import { db } from '@/db';
import { tests, questions, testAttempts, attemptAnswers, ethicsScores } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// GET /api/tests/[id] — Get a test with its questions
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const [test] = await db.select().from(tests).where(eq(tests.id, id));
        if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });

        const testQuestions = await db.select().from(questions).where(eq(questions.testId, id)).orderBy(questions.orderIndex);

        return NextResponse.json({ test, questions: testQuestions });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT /api/tests/[id] — Update test details and questions
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, description, category, difficulty, status, questionsList } = body;

        // Update test metadata
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (difficulty !== undefined) updateData.difficulty = difficulty;
        if (status !== undefined) updateData.status = status;

        if (Object.keys(updateData).length > 0) {
            await db.update(tests).set(updateData).where(eq(tests.id, id));
        }

        // If questions provided, replace all questions
        if (questionsList && questionsList.length > 0) {
            // Delete old questions
            await db.delete(questions).where(eq(questions.testId, id));
            // Insert new
            await db.insert(questions).values(
                questionsList.map((q: any, i: number) => ({
                    testId: id,
                    questionText: q.questionText,
                    scenario: q.scenario || '',
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    category: q.category || category || 'General',
                    explanation: q.explanation || '',
                    orderIndex: i,
                }))
            );
            await db.update(tests).set({ totalQuestions: questionsList.length }).where(eq(tests.id, id));
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/tests/[id] — Delete test and all related data
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Get all attempts for this test to clean up related data
        const relatedAttempts = await db.select({ id: testAttempts.id }).from(testAttempts).where(eq(testAttempts.testId, id));
        for (const attempt of relatedAttempts) {
            await db.delete(attemptAnswers).where(eq(attemptAnswers.attemptId, attempt.id));
            await db.delete(ethicsScores).where(eq(ethicsScores.attemptId, attempt.id));
        }
        await db.delete(testAttempts).where(eq(testAttempts.testId, id));
        await db.delete(questions).where(eq(questions.testId, id));
        await db.delete(tests).where(eq(tests.id, id));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
