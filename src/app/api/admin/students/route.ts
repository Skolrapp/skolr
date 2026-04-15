import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

function toPercent(progressSeconds: number, durationSeconds: number) {
  if (!durationSeconds) return 0;
  return Math.max(0, Math.min(100, Math.round((progressSeconds / durationSeconds) * 100)));
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const q = (request.nextUrl.searchParams.get('q') || '').trim();
  const supabase = createSupabaseAdmin();

  let usersQuery = supabase
    .from('users')
    .select('id, name, phone, created_at, subscription_tier')
    .eq('role', 'student')
    .eq('account_type', 'individual')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (q) {
    const search = `%${q}%`;
    usersQuery = usersQuery.or(`name.ilike.${search},phone.ilike.${search}`);
  }

  const { data: students, error } = await usersQuery;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const studentIds = (students || []).map((student) => student.id);
  const { data: enrollments } = studentIds.length
    ? await supabase
        .from('enrollments')
        .select('user_id, progress_seconds, completed, completed_at, courses(subject, title, duration_seconds)')
        .in('user_id', studentIds)
    : { data: [] as any[] };

  const byStudent = new Map<string, any[]>();
  (enrollments || []).forEach((entry: any) => {
    const current = byStudent.get(entry.user_id) || [];
    current.push(entry);
    byStudent.set(entry.user_id, current);
  });

  const data = (students || []).map((student) => {
    const entries = byStudent.get(student.id) || [];
    const subjectProgress = entries.reduce<Record<string, { total: number; count: number }>>((acc, entry: any) => {
      const subject = entry.courses?.subject || 'Unknown';
      const percent = toPercent(entry.progress_seconds || 0, entry.courses?.duration_seconds || 0);
      acc[subject] = acc[subject] || { total: 0, count: 0 };
      acc[subject].total += percent;
      acc[subject].count += 1;
      return acc;
    }, {});

    const progressBySubject = Object.entries(subjectProgress).map(([subject, value]) => ({
      subject,
      completion_percent: Math.round(value.total / Math.max(1, value.count)),
    }));

    const overallProgress = progressBySubject.length
      ? Math.round(progressBySubject.reduce((sum, item) => sum + item.completion_percent, 0) / progressBySubject.length)
      : 0;

    return {
      ...student,
      overall_progress: overallProgress,
      active_subjects: progressBySubject.length,
      progress_by_subject: progressBySubject.sort((a, b) => a.subject.localeCompare(b.subject)),
      completed_courses: entries.filter((entry: any) => entry.completed).length,
    };
  });

  return NextResponse.json({ success: true, data });
}
