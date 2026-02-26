import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
    try {
        const { answers, questions } = await request.json();

        const prompt = `You are an ethics evaluation AI. Analyze these employee ethics test responses and provide a detailed evaluation.

Questions and Answers:
${questions.map((q: any, i: number) => `
Q${i + 1}: ${q.questionText}
Scenario: ${q.scenario}
Selected Answer: ${answers[i]?.selectedAnswer || 'Not answered'}
Correct Answer: ${q.correctAnswer}
Category: ${q.category}
`).join('\n')}

Provide evaluation in this exact JSON format:
{
  "overallScore": 85,
  "categoryScores": {
    "integrity": 82,
    "fairness": 78,
    "accountability": 90,
    "transparency": 75,
    "respect": 88
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "summary": "A 2-3 sentence overall assessment of the employee's ethical decision-making",
  "riskLevel": "low",
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Score each category 0-100. Risk levels: "low", "medium", "high", "critical".
Be fair but thorough in your assessment.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const evaluation = JSON.parse(content);

        return NextResponse.json({ evaluation });
    } catch (error: any) {
        console.error('AI evaluation error:', error);
        return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
    }
}
