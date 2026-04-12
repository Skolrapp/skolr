import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Only instructors can view courses.' }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, subject, category, sub_category, thumbnail_url, is_published, created_at')
    .eq('instructor_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const courseIds = (courses || []).map((course) => course.id);
  const chapterCounts = new Map<string, number>();

  if (courseIds.length > 0) {
    const { data: chapters } = await supabase
      .from('chapters')
      .select('course_id')
      .in('course_id', courseIds);

    (chapters || []).forEach((chapter) => {
      chapterCounts.set(chapter.course_id, (chapterCounts.get(chapter.course_id) || 0) + 1);
    });
  }

  const items = (courses || []).map((course) => ({
    ...course,
    chapter_count: chapterCounts.get(course.id) || 0,
  }));

  return NextResponse.json({ success: true, data: items });
}
