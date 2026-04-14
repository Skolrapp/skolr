import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string; resourceId: string }> }) {
  const { id, resourceId } = await params;
  const supabase = createSupabaseAdmin();
  const { data: resource } = await supabase
    .from('course_resources')
    .select('id, course_id, url, storage_bucket, storage_path')
    .eq('id', resourceId)
    .eq('course_id', id)
    .single();

  if (!resource) {
    return NextResponse.json({ success: false, error: 'Resource not found.' }, { status: 404 });
  }

  let targetUrl = resource.url;

  if (!targetUrl && resource.storage_bucket && resource.storage_path) {
    const { data } = supabase.storage.from(resource.storage_bucket).getPublicUrl(resource.storage_path);
    targetUrl = data.publicUrl;
  }

  if (!targetUrl) {
    return NextResponse.json({ success: false, error: 'Resource file is unavailable.' }, { status: 404 });
  }

  return NextResponse.redirect(targetUrl);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; resourceId: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Only instructors can remove resources.' }, { status: 403 });
  }

  const { id, resourceId } = await params;
  const supabase = createSupabaseAdmin();
  const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', id).single();

  if (!course || (course.instructor_id !== session.user.id && session.user.role !== 'admin')) {
    return NextResponse.json({ success: false, error: 'Not your course.' }, { status: 403 });
  }

  const { data: resource } = await supabase
    .from('course_resources')
    .select('id, course_id, storage_bucket, storage_path')
    .eq('id', resourceId)
    .eq('course_id', id)
    .single();

  if (!resource) {
    return NextResponse.json({ success: false, error: 'Resource not found.' }, { status: 404 });
  }

  if (resource.storage_bucket && resource.storage_path) {
    await supabase.storage.from(resource.storage_bucket).remove([resource.storage_path]);
  }

  const { error } = await supabase.from('course_resources').delete().eq('id', resourceId).eq('course_id', id);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
