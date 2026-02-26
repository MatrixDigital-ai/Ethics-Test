import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tests, questions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
    try {
        const testList = await db.select().from(tests).orderBy(desc(tests.createdAt));
        return NextResponse.json({ tests: testList });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, category, difficulty, totalQuestions, timeLimit, createdBy, generatedQuestions } = body;

        const [newTest] = await db
            .insert(tests)
            .values({
                title,
                description,
                category,
                difficulty,
                totalQuestions: generatedQuestions?.length || totalQuestions || 10,
                timeLimit: timeLimit || 30,
                createdBy,
            })
            .returning();

        if (generatedQuestions && generatedQuestions.length > 0) {
            await db.insert(questions).values(
                generatedQuestions.map((q: any, i: number) => ({
                    testId: newTest.id,
                    questionText: q.questionText,
                    scenario: q.scenario,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    category: q.category,
                    explanation: q.explanation,
                    difficulty: q.difficulty || 3,
                    orderIndex: i,
                }))
            );
        }

        return NextResponse.json({ test: newTest }, { status: 201 });
    } catch (error: any) {
        console.error('Create test error:', error);
        return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
    }
}
