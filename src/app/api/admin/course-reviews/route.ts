import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('course_review_requests')
    .select('id, status, admin_notes, submitted_at, reviewed_at, course_id, instructor_id, courses(title, subject, category, sub_category, thumbnail_url), users!instructor_id(name, phone)')
    .order('submitted_at', { ascending: true });

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

  return NextResponse.json({ success: true, data: data || [] });
}
