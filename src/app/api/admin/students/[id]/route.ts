import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

function toPercent(progressSeconds: number, durationSeconds: number) {
  if (!durationSeconds) return 0;
  return Math.max(0, Math.min(100, Math.round((progressSeconds / durationSeconds) * 100)));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const { data: student, error: studentError } = await supabase
    .from('users')
    .select('id, name, phone, created_at, subscription_tier, subscription_expires_at')
    .eq('id', id)
    .eq('role', 'student')
    .single();

  if (studentError || !student) {
    return NextResponse.json({ success: false, error: 'Student not found.' }, { status: 404 });
  }

  const [{ data: enrollments, error: enrollmentsError }, { data: sessions }] = await Promise.all([
    supabase
      .from('enrollments')
      .select('enrolled_at, progress_seconds, completed, completed_at, courses(id, title, subject, duration_seconds, category, sub_category)')
      .eq('user_id', id)
      .order('enrolled_at', { ascending: false }),
    supabase
      .from('user_sessions')
      .select('created_at, expires_at, ip_address')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (enrollmentsError) {
    return NextResponse.json({ success: false, error: enrollmentsError.message }, { status: 500 });
  }

  const subjectProgress = ((enrollments || []) as any[]).reduce((acc: Record<string, { total: number; count: number }>, entry: any) => {
    const subject = entry.courses?.subject || 'Unknown';
    const percent = toPercent(entry.progress_seconds || 0, entry.courses?.duration_seconds || 0);
    acc[subject] = acc[subject] || { total: 0, count: 0 };
    acc[subject].total += percent;
    acc[subject].count += 1;
    return acc;
  }, {});

  const progressBySubject = Object.entries(subjectProgress)
    .map(([subject, value]: [string, { total: number; count: number }]) => ({
      subject,
      completion_percent: Math.round(value.total / Math.max(1, value.count)),
    }))
    .sort((a, b) => b.completion_percent - a.completion_percent);

  const recentCourses = (enrollments || []).slice(0, 8).map((entry: any) => ({
    course_id: entry.courses?.id,
    title: entry.courses?.title || 'Untitled course',
    subject: entry.courses?.subject || 'Unknown',
    category: entry.courses?.category || null,
    sub_category: entry.courses?.sub_category || null,
    enrolled_at: entry.enrolled_at,
    completed: !!entry.completed,
    completed_at: entry.completed_at || null,
    progress_seconds: entry.progress_seconds || 0,
    duration_seconds: entry.courses?.duration_seconds || 0,
    completion_percent: toPercent(entry.progress_seconds || 0, entry.courses?.duration_seconds || 0),
  }));

  const recentActivity = [
    ...(enrollments || []).map((entry: any) => ({
      type: entry.completed ? 'completion' : 'enrollment',
      timestamp: entry.completed && entry.completed_at ? entry.completed_at : entry.enrolled_at,
      label: entry.completed
        ? `Completed ${entry.courses?.title || 'a course'}`
        : `Enrolled in ${entry.courses?.title || 'a course'}`,
    })),
    ...((sessions || []) as any[]).map((sessionEntry) => ({
      type: 'login',
      timestamp: sessionEntry.created_at,
      label: `Logged in${sessionEntry.ip_address ? ` from ${sessionEntry.ip_address}` : ''}`,
    })),
  ]
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
    .slice(0, 10);

  return NextResponse.json({
    success: true,
    data: {
      ...student,
      total_enrollments: (enrollments || []).length,
      completed_courses: (enrollments || []).filter((entry: any) => entry.completed).length,
      last_seen_at: (sessions || [])[0]?.created_at || null,
      progress_by_subject: progressBySubject,
      recent_courses: recentCourses,
      recent_activity: recentActivity,
    },
  });
}
