import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
    try {
        const { category, difficulty, count } = await request.json();

        const prompt = `Generate ${count || 5} ethical scenario-based multiple choice questions for employee ethics testing.

Category focus: ${category || 'General Ethics'}
Difficulty: ${difficulty || 'Medium'}

Each question MUST follow this exact JSON format. Return ONLY a JSON array, no extra text:
[
  {
    "questionText": "Clear ethical dilemma question",
    "scenario": "A detailed workplace scenario (2-3 sentences) describing an ethical situation",
    "options": [
      {"id": "a", "text": "Option text", "ethicsWeight": {"integrity": 0.8, "fairness": 0.6, "accountability": 0.7, "transparency": 0.5, "respect": 0.9}},
      {"id": "b", "text": "Option text", "ethicsWeight": {"integrity": 0.3, "fairness": 0.4, "accountability": 0.2, "transparency": 0.3, "respect": 0.4}},
      {"id": "c", "text": "Option text", "ethicsWeight": {"integrity": 0.5, "fairness": 0.7, "accountability": 0.6, "transparency": 0.8, "respect": 0.5}},
      {"id": "d", "text": "Option text", "ethicsWeight": {"integrity": 0.1, "fairness": 0.2, "accountability": 0.1, "transparency": 0.1, "respect": 0.2}}
    ],
    "correctAnswer": "a",
    "category": "Integrity",
    "explanation": "Why this answer is the most ethical choice",
    "difficulty": 3
  }
]

Ethics dimensions (score each 0-1):
- Integrity: Honesty, moral principles, doing the right thing
- Fairness: Equitable treatment, unbiased decisions
- Accountability: Taking responsibility, owning consequences
- Transparency: Open communication, honesty about processes
- Respect: Dignity, inclusivity, valuing others

Make scenarios realistic workplace situations. The correct answer should have the highest combined ethics weight. Vary categories across: Integrity, Fairness, Accountability, Transparency, Respect.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content || '[]';
        let questions;
        try {
            const parsed = JSON.parse(content);
            questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
        } catch {
            questions = [];
        }

        return NextResponse.json({ questions });
    } catch (error: any) {
        console.error('AI generation error:', error);
        return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }
}
