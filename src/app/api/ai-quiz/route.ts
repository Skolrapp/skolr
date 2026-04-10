import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { courseTitle, subject, level, subCategory } = await request.json() as {
    courseTitle: string;
    subject: string;
    level: string;
    subCategory?: string;
  };

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
            content: `You are an expert Tanzanian teacher creating a quiz for students.

Course: ${courseTitle}
Subject: ${subject}
Level: ${level} ${subCategory ? `(${subCategory})` : ''}
Curriculum: Tanzania NECTA

Generate exactly 5 multiple choice questions based on this course topic.

Rules:
- Questions must match the level (${subCategory || level})
- Each question has exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Questions should test understanding, not just memorization
- Keep language clear and simple

Respond ONLY with a JSON array, no other text, no markdown:
[
  {
    "question": "question text here",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "correct": "A",
    "explanation": "brief explanation of why this is correct"
  }
]`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;

    // Parse the JSON response
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);

    return NextResponse.json({ success: true, questions });
  } catch (err) {
    console.error('[ai-quiz]', err);
    return NextResponse.json({ success: false, error: 'Failed to generate quiz.' }, { status: 500 });
  }
}
