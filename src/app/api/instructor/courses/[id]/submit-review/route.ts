import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Only instructors can submit courses for review.' }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, instructor_id')
    .eq('id', id)
    .single();

  if (courseError || !course) {
    return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });
  }

  if (course.instructor_id !== session.user.id && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Not your course.' }, { status: 403 });
  }

  const { count } = await supabase
    .from('chapters')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', id);

  if ((count || 0) === 0) {
    return NextResponse.json({ success: false, error: 'Add at least one chapter before submitting for review.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('course_review_requests')
    .upsert(
      {
        id: uuidv4(),
        course_id: id,
        instructor_id: course.instructor_id,
        status: 'pending',
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'course_id' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message.includes('course_review_requests')
          ? 'Review workflow is not set up yet. Run the SQL in src/lib/supabase/course-review-workflow.sql.'
          : error.message,
      },
      { status: 500 }
    );
  }

  await supabase.from('courses').update({ is_published: false }).eq('id', id);

  return NextResponse.json({
    success: true,
    data,
    message: `"${course.title}" is now waiting for admin review.`,
  });
}
