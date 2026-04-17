import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { saveCourseProgressForUser } from '@/lib/courseProgress';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { progressSeconds, lessonId, lessonProgressSeconds } = await request.json() as {
    progressSeconds?: number;
    lessonId?: string | null;
    lessonProgressSeconds?: number;
  };

  if (typeof progressSeconds !== 'number' || progressSeconds < 0) {
    return NextResponse.json({ success: false, error: 'Valid progress is required.' }, { status: 400 });
  }

  const result = await saveCourseProgressForUser(session.user, id, Math.floor(progressSeconds), {
    lessonId: lessonId || null,
    lessonProgressSeconds: typeof lessonProgressSeconds === 'number' ? lessonProgressSeconds : Math.floor(progressSeconds),
  });
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
