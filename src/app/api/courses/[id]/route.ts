import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const { data: course, error } = await supabase
    .from('courses')
    .select('*, users!instructor_id(name)')
    .eq('id', id)
    .single();

  if (error || !course) return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });

  const canViewDraft = !!session && (
    session.user.role === 'admin' ||
    course.instructor_id === session.user.id
  );

  if (!course.is_published && !canViewDraft) {
    return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });
  }

  // Get enrollment progress
  let enrollment: { progress_seconds?: number; completed?: boolean } | null = null;
  if (session) {
    const enrollmentResult = await supabase
      .from('enrollments')
      .select('progress_seconds, completed')
      .eq('user_id', session.user.id)
      .eq('course_id', id)
      .single();
    enrollment = enrollmentResult.data;
  }

  // Increment view count
  if (course.is_published) {
    await supabase.from('courses').update({ view_count: (course.view_count || 0) + 1 }).eq('id', id);
  }

  const { data: review } = await supabase
    .from('course_review_requests')
    .select('status, admin_notes, reviewed_at')
    .eq('course_id', id)
    .order('reviewed_at', { ascending: false, nullsFirst: false })
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    success: true,
    data: {
      course: {
        ...course,
        instructor_name: (course.users as { name: string } | null)?.name || 'Unknown',
        review_status: review?.status || null,
        admin_notes: review?.admin_notes || null,
        reviewed_at: review?.reviewed_at || null,
        users: undefined,
      },
      progress_seconds: enrollment?.progress_seconds ?? 0,
      enrolled: !!enrollment,
      guest_preview: !session,
    },
  });
}
