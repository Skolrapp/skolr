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

  const { data: reviews, error: reviewError } = await supabase
    .from('course_review_requests')
    .select('course_id, status, admin_notes, reviewed_at')
    .in('course_id', courseIds.length > 0 ? courseIds : ['00000000-0000-0000-0000-000000000000'])
    .order('reviewed_at', { ascending: false, nullsFirst: false })
    .order('submitted_at', { ascending: false });

  if (reviewError && !reviewError.message.includes('course_review_requests')) {
    return NextResponse.json({ success: false, error: reviewError.message }, { status: 500 });
  }

  const reviewByCourseId = new Map<string, { status: string | null; admin_notes: string | null; reviewed_at: string | null }>();
  ((reviews || []) as Array<{ course_id: string; status: string | null; admin_notes: string | null; reviewed_at: string | null }>).forEach((review) => {
    if (!reviewByCourseId.has(review.course_id)) {
      reviewByCourseId.set(review.course_id, review);
    }
  });

  const enriched = items.map((course) => {
    const review = reviewByCourseId.get(course.id);
    return {
      ...course,
      review_status: review?.status || null,
      admin_notes: review?.admin_notes || null,
      reviewed_at: review?.reviewed_at || null,
    };
  });

  return NextResponse.json({ success: true, data: enriched });
}
