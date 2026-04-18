import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getActiveLearnerFromCookies } from '@/lib/activeLearner';
import { createSupabaseAdmin } from '@/lib/supabase/server';

function isMissingResumeColumn(message?: string) {
  return !!message && (
    message.includes('last_lesson_id') ||
    message.includes('last_lesson_progress_seconds')
  );
}

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
  let enrollment: { progress_seconds?: number; completed?: boolean; last_lesson_id?: string | null; last_lesson_progress_seconds?: number | null } | null = null;
  let activeLearnerName: string | null = null;
  if (session) {
    const { activeLearner } = await getActiveLearnerFromCookies(session.user);
    activeLearnerName = activeLearner?.full_name || null;
    let enrollmentResult;
    if (activeLearner?.id) {
      enrollmentResult = await supabase
        .from('enrollments')
        .select('progress_seconds, completed, last_lesson_id, last_lesson_progress_seconds')
        .eq('user_id', session.user.id)
        .eq('learner_profile_id', activeLearner.id)
        .eq('course_id', id)
        .order('enrolled_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (enrollmentResult.error && isMissingResumeColumn(enrollmentResult.error.message)) {
        enrollmentResult = await supabase
          .from('enrollments')
          .select('progress_seconds, completed')
          .eq('user_id', session.user.id)
          .eq('learner_profile_id', activeLearner.id)
          .eq('course_id', id)
          .order('enrolled_at', { ascending: false })
          .limit(1)
          .maybeSingle();
      }
    } else {
      enrollmentResult = await supabase
        .from('enrollments')
        .select('progress_seconds, completed, last_lesson_id, last_lesson_progress_seconds')
        .eq('user_id', session.user.id)
        .eq('course_id', id)
        .is('learner_profile_id', null)
        .order('enrolled_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (enrollmentResult.error && isMissingResumeColumn(enrollmentResult.error.message)) {
        enrollmentResult = await supabase
          .from('enrollments')
          .select('progress_seconds, completed')
          .eq('user_id', session.user.id)
          .eq('course_id', id)
          .is('learner_profile_id', null)
          .order('enrolled_at', { ascending: false })
          .limit(1)
          .maybeSingle();
      }
    }
    enrollment = enrollmentResult.data;
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
      last_lesson_id: enrollment?.last_lesson_id ?? 'intro',
      last_lesson_progress_seconds: enrollment?.last_lesson_progress_seconds ?? 0,
      enrolled: !!enrollment,
      active_learner_name: activeLearnerName,
      guest_preview: !session,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, instructor_id, is_published')
    .eq('id', id)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });
  }

  const canEdit = session.user.role === 'admin' || (course.instructor_id === session.user.id && !course.is_published);
  if (!canEdit) {
    return NextResponse.json({ success: false, error: 'Only admins or the draft-course instructor can edit this course.' }, { status: 403 });
  }

  const body = await request.json() as {
    title?: string;
    description?: string | null;
    category?: string;
    sub_category?: string | null;
    subject?: string;
    video_hls_url?: string;
    thumbnail_url?: string | null;
    duration_seconds?: number;
    language?: 'en' | 'sw' | 'both';
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ success: false, error: 'Title is required.' }, { status: 400 });
  }

  if (!body.category) {
    return NextResponse.json({ success: false, error: 'Education level is required.' }, { status: 400 });
  }

  if (!body.subject?.trim()) {
    return NextResponse.json({ success: false, error: 'Subject is required.' }, { status: 400 });
  }

  if (!body.video_hls_url?.trim() || !body.video_hls_url.endsWith('.m3u8')) {
    return NextResponse.json({ success: false, error: 'A valid intro video is required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('courses')
    .update({
      title: body.title.trim(),
      description: body.description?.trim() || null,
      category: body.category,
      sub_category: body.sub_category || null,
      subject: body.subject.trim(),
      video_hls_url: body.video_hls_url.trim(),
      thumbnail_url: body.thumbnail_url?.trim() || null,
      duration_seconds: body.duration_seconds || 0,
      language: body.language || 'en',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
