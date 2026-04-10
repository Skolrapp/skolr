import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { question, studentAnswer, correctAnswer, explanation, subject, level } = await request.json() as {
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    explanation: string;
    subject: string;
    level: string;
  };

  const isCorrect = studentAnswer === correctAnswer;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are a supportive Tanzanian teacher giving feedback to a student.

Subject: ${subject}
Level: ${level}
Question: ${question}
Student answered: ${studentAnswer}
Correct answer: ${correctAnswer}
The student was: ${isCorrect ? 'CORRECT' : 'INCORRECT'}
Explanation: ${explanation}

Give the student encouraging, helpful feedback in 2-3 sentences.
- If correct: praise them and reinforce why it's correct
- If incorrect: gently explain why their answer was wrong and what the correct concept is
- Keep it simple, warm and encouraging
- Do not use bullet points, just natural sentences
- Speak directly to the student as "you"

Respond with just the feedback text, nothing else.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const feedback = data.content[0].text;

    return NextResponse.json({ success: true, feedback, isCorrect });
  } catch (err) {
    console.error('[ai-feedback]', err);
    return NextResponse.json({ success: false, error: 'Failed to get feedback.' }, { status: 500 });
  }
}
