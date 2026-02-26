import { db } from '@/db';
import { tests, questions } from '@/db/schema';
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

// DELETE /api/tests/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(tests).where(eq(tests.id, id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
