import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const supabase = createSupabaseAdmin();
  const { data: rows, error } = await supabase
    .from('transactions')
    .select('id, amount, platform_fee, net_amount, status, billing_cycle, subscription_tier, created_at, settled_at, users!user_id(name, phone)')
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(100);

  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    supabase
      .from('courses')
      .select('id, title, subject, instructor_id, is_published, users!instructor_id(name)')
      .eq('is_published', true),
    supabase
      .from('enrollments')
      .select('course_id, progress_seconds, completed'),
  ]);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const transactions = (rows || []) as Array<{
    id: string;
    amount: number;
    platform_fee: number;
    net_amount: number;
    status: string;
    billing_cycle: string;
    subscription_tier: string;
    created_at: string;
    settled_at?: string | null;
    users?: { name?: string; phone?: string } | null;
  }>;

  const totals = transactions.reduce((acc, entry) => {
    acc.totalRevenue += entry.amount || 0;
    acc.skolrShare += entry.platform_fee || 0;
    acc.instructorPool += entry.net_amount || 0;
    acc.totalTransactions += 1;
    if (entry.billing_cycle === 'annual') acc.annualTransactions += 1;
    else acc.monthlyTransactions += 1;
    return acc;
  }, {
    totalRevenue: 0,
    skolrShare: 0,
    instructorPool: 0,
    totalTransactions: 0,
    monthlyTransactions: 0,
    annualTransactions: 0,
  });

  const split = totals.totalRevenue > 0
    ? {
        skolrPercent: (totals.skolrShare / totals.totalRevenue) * 100,
        instructorPercent: (totals.instructorPool / totals.totalRevenue) * 100,
      }
    : {
        skolrPercent: 0,
      instructorPercent: 0,
    };

  const courseMap = new Map<string, {
    id: string;
    title: string;
    subject: string;
    instructor_id: string;
    instructor_name: string;
    watch_seconds: number;
    learners: number;
    completions: number;
  }>();

  ((courses || []) as Array<{ id: string; title: string; subject: string; instructor_id: string; users?: { name?: string } | null }>).forEach((course) => {
    courseMap.set(course.id, {
      id: course.id,
      title: course.title,
      subject: course.subject,
      instructor_id: course.instructor_id,
      instructor_name: course.users?.name || 'Unknown instructor',
      watch_seconds: 0,
      learners: 0,
      completions: 0,
    });
  });

  (enrollments || []).forEach((entry) => {
    const current = courseMap.get(entry.course_id);
    if (!current) return;
    current.watch_seconds += Number(entry.progress_seconds || 0);
    current.learners += 1;
    current.completions += entry.completed ? 1 : 0;
  });

  const totalWatchSeconds = Array.from(courseMap.values()).reduce((sum, course) => sum + course.watch_seconds, 0);

  const courseRows = Array.from(courseMap.values()).map((course) => ({
    ...course,
    watch_minutes: Math.round(course.watch_seconds / 60),
    completion_rate: course.learners > 0 ? Math.round((course.completions / course.learners) * 100) : 0,
    watch_share_percent: totalWatchSeconds > 0 ? (course.watch_seconds / totalWatchSeconds) * 100 : 0,
    estimated_payout: totalWatchSeconds > 0 ? Math.round(totals.instructorPool * (course.watch_seconds / totalWatchSeconds)) : 0,
  }));

  const instructorMap = new Map<string, {
    instructor_id: string;
    instructor_name: string;
    courses: number;
    watch_seconds: number;
    learners: number;
  }>();

  courseRows.forEach((course) => {
    const current = instructorMap.get(course.instructor_id) || {
      instructor_id: course.instructor_id,
      instructor_name: course.instructor_name,
      courses: 0,
      watch_seconds: 0,
      learners: 0,
    };
    current.courses += 1;
    current.watch_seconds += course.watch_seconds;
    current.learners += course.learners;
    instructorMap.set(course.instructor_id, current);
  });

  const instructorRows = Array.from(instructorMap.values())
    .map((instructor) => ({
      ...instructor,
      watch_minutes: Math.round(instructor.watch_seconds / 60),
      watch_share_percent: totalWatchSeconds > 0 ? (instructor.watch_seconds / totalWatchSeconds) * 100 : 0,
      estimated_payout: totalWatchSeconds > 0 ? Math.round(totals.instructorPool * (instructor.watch_seconds / totalWatchSeconds)) : 0,
    }))
    .sort((a, b) => b.watch_seconds - a.watch_seconds);

  return NextResponse.json({
    success: true,
    data: {
      totals,
      split,
      transactions,
      top_courses: courseRows.slice().sort((a, b) => b.watch_seconds - a.watch_seconds).slice(0, 5),
      low_courses: courseRows.slice().sort((a, b) => a.watch_seconds - b.watch_seconds).slice(0, 5),
      instructor_estimates: instructorRows.slice(0, 8),
    },
  });
}
