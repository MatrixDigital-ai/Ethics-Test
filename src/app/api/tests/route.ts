import { db } from '@/db';
import { tests, questions } from '@/db/schema';
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

// POST — Two modes: "generate" (AI only, no DB) and "publish" (save to DB)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { mode } = body;

        // ─── MODE: GENERATE — AI generates questions, returns them for preview ───
        if (mode === 'generate') {
            const { title, category, difficulty, questionCount } = body;

            const aiResponse = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are a test question generator. Generate exactly ${questionCount || 5} multiple-choice questions.
Return ONLY a valid JSON array. Each object must have these exact fields:
- "questionText": string (the question)
- "scenario": string (a realistic context/scenario for the question)
- "options": array of exactly 4 objects, each with {"id": "a"|"b"|"c"|"d", "text": "string"}
- "correctAnswer": "a"|"b"|"c"|"d"
- "category": string (topic category)
- "explanation": string (why the correct answer is right)
Return ONLY the JSON array. No markdown, no text before or after, no code blocks.`,
                    },
                    {
                        role: 'user',
                        content: `Generate ${questionCount || 5} multiple-choice questions about "${category || 'General Knowledge'}" at "${difficulty || 'Medium'}" difficulty. Make them thoughtful and scenario-based.`,
                    },
                ],
                temperature: 0.7,
                max_tokens: 6000,
            });

            const content = aiResponse.choices[0]?.message?.content || '[]';
            let generatedQuestions;
            try {
                const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                generatedQuestions = JSON.parse(cleaned);
            } catch {
                return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 422 });
            }

            if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
                return NextResponse.json({ error: 'AI did not generate any questions. Please try again.' }, { status: 422 });
            }

            // Return questions for preview — NOT saved to DB yet
            return NextResponse.json({ questions: generatedQuestions });
        }

        // ─── MODE: PUBLISH — Save test + questions to DB ───
        if (mode === 'publish') {
            const { title, description, category, difficulty, questionsList } = body;

            if (!title || !questionsList || questionsList.length === 0) {
                return NextResponse.json({ error: 'Title and questions are required' }, { status: 400 });
            }

            // Create the test
            const [newTest] = await db.insert(tests).values({
                title,
                description: description || '',
                category: category || 'General',
                difficulty: difficulty || 'Medium',
                totalQuestions: questionsList.length,
                timeLimit: 30,
                status: 'active',
            }).returning();

            // Insert questions
            await db.insert(questions).values(
                questionsList.map((q: any, i: number) => ({
                    testId: newTest.id,
                    questionText: q.questionText,
                    scenario: q.scenario || '',
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    category: q.category || category || 'General',
                    explanation: q.explanation || '',
                    orderIndex: i,
                }))
            );

            return NextResponse.json({ test: newTest, questionCount: questionsList.length });
        }

        return NextResponse.json({ error: 'Invalid mode. Use "generate" or "publish".' }, { status: 400 });
    } catch (error: any) {
        console.error('Test API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
