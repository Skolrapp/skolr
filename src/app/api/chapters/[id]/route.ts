import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

function isMissingReleaseAt(message?: string) {
  return !!message && message.includes('release_at');
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const supabase = createSupabaseAdmin();
  const { data: chapter } = await supabase.from('chapters').select('course_id, courses(instructor_id)').eq('id', id).single();
  if (!chapter) return NextResponse.json({ success: false, error: 'Chapter not found.' }, { status: 404 });
  const course = chapter.courses as unknown as { instructor_id: string };
  if (course.instructor_id !== session.user.id && session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Not your chapter.' }, { status: 403 });
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title) updates.title = body.title.trim();
  if (body.description) updates.description = body.description;
  if (body.video_hls_url) updates.video_hls_url = body.video_hls_url;
  if (body.duration_seconds) updates.duration_seconds = body.duration_seconds;
  if (body.order_index !== undefined) updates.order_index = body.order_index;
  if (body.release_at !== undefined) updates.release_at = body.release_at || null;
  let { data, error } = await supabase.from('chapters').update(updates).eq('id', id).select().single();

  if (error && isMissingReleaseAt(error.message)) {
    delete updates.release_at;
    const fallback = await supabase.from('chapters').update(updates).eq('id', id).select().single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  const { data: chapter } = await supabase.from('chapters').select('course_id, courses(instructor_id)').eq('id', id).single();
  if (!chapter) return NextResponse.json({ success: false, error: 'Chapter not found.' }, { status: 404 });
  const course = chapter.courses as unknown as { instructor_id: string };
  if (course.instructor_id !== session.user.id && session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Not your chapter.' }, { status: 403 });
  await supabase.from('chapters').delete().eq('id', id);
  const { count } = await supabase.from('chapters').select('*', { count: 'exact', head: true }).eq('course_id', chapter.course_id);
  await supabase.from('courses').update({ total_chapters: count || 0 }).eq('id', chapter.course_id);
  return NextResponse.json({ success: true });
}
