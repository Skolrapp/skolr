import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  const { data } = await supabase.from('course_resources').select('*').eq('course_id', id).order('created_at', { ascending: true });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'instructor' && session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Only instructors can add resources.' }, { status: 403 });
  const { id } = await params;
  const { title, type, url, description } = await request.json() as { title: string; type: string; url?: string; description?: string };
  if (!title?.trim()) return NextResponse.json({ success: false, error: 'Title required.' }, { status: 400 });
  const supabase = createSupabaseAdmin();
  const { data: course } = await supabase.from('courses').select('instructor_id').eq('id', id).single();
  if (!course || (course.instructor_id !== session.user.id && session.user.role !== 'admin')) return NextResponse.json({ success: false, error: 'Not your course.' }, { status: 403 });
  const { data, error } = await supabase.from('course_resources').insert({ course_id: id, title: title.trim(), type: type || 'note', url: url || null, description: description || null, created_by: session.user.id }).select().single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data }, { status: 201 });
}
