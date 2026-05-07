import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Only instructors can view engagement.' }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();
  const [{ data: courses, error: coursesError }, { data: transactions }] = await Promise.all([
    supabase
      .from('courses')
      .select('id, title, subject, category, sub_category, is_published, created_at')
      .eq('instructor_id', session.user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('transactions')
      .select('net_amount')
      .eq('status', 'success'),
  ]);

  if (coursesError) return NextResponse.json({ success: false, error: coursesError.message }, { status: 500 });

  const courseRows = (courses || []) as Array<{
    id: string;
    title: string;
    subject: string;
    category: string;
    sub_category?: string | null;
    is_published: boolean;
    created_at: string;
  }>;

  const courseIds = courseRows.map((course) => course.id);
  if (courseIds.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        total_watch_minutes: 0,
        estimated_payout: 0,
        total_learners: 0,
        courses: [],
      },
    });
  }

  const [{ data: instructorEnrollments }, { data: allCourseRows }, { data: allEnrollments }] = await Promise.all([
    supabase
      .from('enrollments')
      .select('course_id, progress_seconds, completed')
      .in('course_id', courseIds),
    supabase
      .from('courses')
      .select('id, instructor_id')
      .eq('is_published', true),
    supabase
      .from('enrollments')
      .select('course_id, progress_seconds'),
  ]);

  const publishedCourseIds = new Set((allCourseRows || []).map((course) => course.id));
  const totalPlatformWatchSeconds = (allEnrollments || []).reduce((sum, entry) => (
    publishedCourseIds.has(entry.course_id) ? sum + Number(entry.progress_seconds || 0) : sum
  ), 0);
  const totalInstructorPool = (transactions || []).reduce((sum, entry) => sum + Number(entry.net_amount || 0), 0);

  const perCourse = new Map<string, { watchSeconds: number; learners: number; completions: number }>();
  (instructorEnrollments || []).forEach((entry) => {
    const current = perCourse.get(entry.course_id) || { watchSeconds: 0, learners: 0, completions: 0 };
    current.watchSeconds += Number(entry.progress_seconds || 0);
    current.learners += 1;
    current.completions += entry.completed ? 1 : 0;
    perCourse.set(entry.course_id, current);
  });

  const rows = courseRows.map((course) => {
    const metrics = perCourse.get(course.id) || { watchSeconds: 0, learners: 0, completions: 0 };
    const watchShare = totalPlatformWatchSeconds > 0 ? metrics.watchSeconds / totalPlatformWatchSeconds : 0;
    const estimatedPayout = totalInstructorPool * watchShare;
    return {
      ...course,
      watch_minutes: Math.round(metrics.watchSeconds / 60),
      watch_share_percent: watchShare * 100,
      estimated_payout: Math.round(estimatedPayout),
      learners: metrics.learners,
      completions: metrics.completions,
      completion_rate: metrics.learners > 0 ? Math.round((metrics.completions / metrics.learners) * 100) : 0,
    };
  });

  const totalWatchMinutes = rows.reduce((sum, row) => sum + row.watch_minutes, 0);
  const totalLearners = rows.reduce((sum, row) => sum + row.learners, 0);
  const estimatedPayout = rows.reduce((sum, row) => sum + row.estimated_payout, 0);

  return NextResponse.json({
    success: true,
    data: {
      total_watch_minutes: totalWatchMinutes,
      estimated_payout: estimatedPayout,
      total_learners: totalLearners,
      courses: rows.sort((a, b) => b.watch_minutes - a.watch_minutes),
    },
  });
}
