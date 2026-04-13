import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const action = body.action as 'approve' | 'reject';
  const adminNotes = (body.admin_notes as string | undefined)?.trim() || null;

  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ success: false, error: 'Invalid review action.' }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data: review, error: reviewError } = await supabase
    .from('course_review_requests')
    .select('id, course_id')
    .eq('id', id)
    .single();

  if (reviewError || !review) {
    return NextResponse.json({ success: false, error: 'Review request not found.' }, { status: 404 });
  }

  const nextStatus = action === 'approve' ? 'approved' : 'rejected';

  const { data, error } = await supabase
    .from('course_review_requests')
    .update({
      status: nextStatus,
      admin_notes: adminNotes,
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  await supabase
    .from('courses')
    .update({ is_published: action === 'approve' })
    .eq('id', review.course_id);

  return NextResponse.json({ success: true, data });
}
