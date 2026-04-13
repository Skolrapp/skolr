import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const supabase = createSupabaseAdmin();
  const monthAgo = new Date(Date.now() - 30 * 86400 * 1000).toISOString();

  const [
    studentsResult,
    instructorsResult,
    coursesResult,
    reviewsResult,
    transactionsResult,
    sessionsResult,
    enrollmentsResult,
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'instructor'),
    supabase.from('courses').select('id, is_published, subject, created_at'),
    supabase.from('course_review_requests').select('id, status, submitted_at, courses(title), users!instructor_id(name)').order('submitted_at', { ascending: false }).limit(6),
    supabase.from('transactions').select('status, amount, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('user_sessions').select('created_at, users(name, role)').order('created_at', { ascending: false }).limit(8),
    supabase.from('enrollments').select('enrolled_at, completed_at, completed, users(name), courses(title)').order('enrolled_at', { ascending: false }).limit(8),
  ]);

  const courses = (coursesResult.data || []) as Array<{ id: string; is_published: boolean; subject: string; created_at: string }>;
  const transactions = (transactionsResult.data || []) as Array<{ status: string; amount: number; created_at: string }>;
  const monthlyRevenue = transactions
    .filter((txn) => txn.created_at >= monthAgo && txn.status === 'success')
    .reduce((sum, txn) => sum + txn.amount, 0);
  const paymentFailures = transactions.filter((txn) => txn.status === 'failed').length;
  const pendingReviews = (reviewsResult.data || []).filter((item) => item.status === 'pending').length;

  const recentActivity = [
    ...(sessionsResult.data || []).map((entry) => ({
      type: 'login',
      timestamp: entry.created_at,
      label: `${(entry.users as { name?: string } | null)?.name || 'Unknown user'} logged in`,
    })),
    ...(enrollmentsResult.data || []).map((entry) => ({
      type: entry.completed ? 'completion' : 'enrollment',
      timestamp: entry.completed && entry.completed_at ? entry.completed_at : entry.enrolled_at,
      label: entry.completed
        ? `${(entry.users as { name?: string } | null)?.name || 'Student'} completed ${(entry.courses as { title?: string } | null)?.title || 'a course'}`
        : `${(entry.users as { name?: string } | null)?.name || 'Student'} enrolled in ${(entry.courses as { title?: string } | null)?.title || 'a course'}`,
    })),
    ...(reviewsResult.data || []).map((entry) => ({
      type: 'review',
      timestamp: entry.submitted_at,
      label: `${(entry.users as { name?: string } | null)?.name || 'Instructor'} submitted ${(entry.courses as { title?: string } | null)?.title || 'a course'} for review`,
    })),
  ].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)).slice(0, 10);

  const subjectCounts = courses.reduce((acc: Record<string, number>, course) => {
    acc[course.subject] = (acc[course.subject] || 0) + 1;
    return acc;
  }, {});

  const topSubjects = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([subject, count]) => ({ subject, count }));

  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        total_students: studentsResult.count || 0,
        total_instructors: instructorsResult.count || 0,
        total_courses: courses.length,
        published_courses: courses.filter((course) => course.is_published).length,
        pending_reviews: pendingReviews,
        monthly_revenue: monthlyRevenue,
        payment_failures: paymentFailures,
      },
      recent_activity: recentActivity,
      top_subjects: topSubjects,
    },
  });
}
