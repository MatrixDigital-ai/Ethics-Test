import { db } from '@/db';
import { tests, questions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// GET — List all tests
export async function GET() {
    try {
        const allTests = await db.select().from(tests).orderBy(tests.createdAt);
        return NextResponse.json({ tests: allTests });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — Create a new test with AI-generated questions
export async function POST(req: Request) {
    try {
        const { title, description, category, difficulty, questionCount } = await req.json();

        // Step 1: Generate questions with Groq AI
        const aiResponse = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are an ethics assessment expert. Generate exactly ${questionCount || 5} multiple-choice ethics questions.
Return ONLY a JSON array. Each object must have:
- questionText: the question
- scenario: a realistic workplace scenario
- options: array of {id: "a"|"b"|"c"|"d", text: "..."}
- correctAnswer: "a"|"b"|"c"|"d"
- category: one of "Integrity", "Fairness", "Accountability", "Transparency", "Respect"
- explanation: why the correct answer is best
Return ONLY the JSON array, no markdown, no extra text.`,
                },
                {
                    role: 'user',
                    content: `Generate ${questionCount || 5} ethics questions about "${category || 'General Ethics'}" at "${difficulty || 'Medium'}" difficulty level. Make them realistic workplace scenarios.`,
                },
            ],
            temperature: 0.7,
            max_tokens: 4000,
        });

        const content = aiResponse.choices[0]?.message?.content || '[]';
        // Try to parse JSON, handling potential markdown wrapping
        let generatedQuestions;
        try {
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            generatedQuestions = JSON.parse(cleaned);
        } catch {
            generatedQuestions = [];
        }

        // Step 2: Create the test in DB
        const [newTest] = await db.insert(tests).values({
            title,
            description,
            category: category || 'General Ethics',
            difficulty: difficulty || 'Medium',
            totalQuestions: generatedQuestions.length || questionCount || 5,
            timeLimit: 30,
            status: 'active',
        }).returning();

        // Step 3: Insert questions into DB
        if (generatedQuestions.length > 0) {
            await db.insert(questions).values(
                generatedQuestions.map((q: any, i: number) => ({
                    testId: newTest.id,
                    questionText: q.questionText,
                    scenario: q.scenario || '',
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    category: q.category || category || 'General Ethics',
                    explanation: q.explanation || '',
                    orderIndex: i,
                }))
            );
        }

        return NextResponse.json({ test: newTest, questionCount: generatedQuestions.length });
    } catch (error: any) {
        console.error('Create test error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
