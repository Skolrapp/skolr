import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

function isMissingReleaseAt(message?: string) {
  return !!message && message.includes('release_at');
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from('chapters')
    .select('*')
    .eq('course_id', id)
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (!session || session.user.role === 'student') {
    query = query.or(`release_at.is.null,release_at.lte.${new Date().toISOString()}`);
  }

  let { data, error } = await query;

  if (error && isMissingReleaseAt(error.message)) {
    const fallback = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', id)
      .eq('is_published', true)
      .order('order_index', { ascending: true });
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'instructor' && session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Only instructors can add chapters.' }, { status: 403 });
  const { id } = await params;
  const { title, description, video_hls_url, duration_seconds, release_at } = await request.json();
  if (!title?.trim()) return NextResponse.json({ success: false, error: 'Title is required.' }, { status: 400 });
  if (!video_hls_url?.endsWith('.m3u8')) return NextResponse.json({ success: false, error: 'Valid .m3u8 URL required.' }, { status: 400 });
  const supabase = createSupabaseAdmin();
  const { data: course } = await supabase.from('courses').select('instructor_id, total_chapters').eq('id', id).single();
  if (!course) return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });
  if (course.instructor_id !== session.user.id && session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Not your course.' }, { status: 403 });
  const { count } = await supabase.from('chapters').select('*', { count: 'exact', head: true }).eq('course_id', id);
  let { data: chapter, error } = await supabase.from('chapters').insert({
    id: uuidv4(),
    course_id: id,
    title: title.trim(),
    description: description || null,
    video_hls_url,
    duration_seconds: duration_seconds || 0,
    order_index: (count || 0),
    is_published: true,
    release_at: release_at || null,
  }).select().single();

  if (error && isMissingReleaseAt(error.message)) {
    const fallback = await supabase.from('chapters').insert({
      id: uuidv4(),
      course_id: id,
      title: title.trim(),
      description: description || null,
      video_hls_url,
      duration_seconds: duration_seconds || 0,
      order_index: (count || 0),
      is_published: true,
    }).select().single();
    chapter = fallback.data;
    error = fallback.error;
  }

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  await supabase.from('courses').update({ total_chapters: (count || 0) + 1 }).eq('id', id);
  return NextResponse.json({ success: true, data: chapter }, { status: 201 });
}
