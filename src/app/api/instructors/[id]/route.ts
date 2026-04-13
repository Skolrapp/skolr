import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();
  const { data: user } = await supabase.from('users').select('id, name, avatar_url, bio, created_at').eq('id', id).eq('role', 'instructor').eq('is_active', true).single();
  if (!user) return NextResponse.json({ success: false, error: 'Instructor not found.' }, { status: 404 });
  const { data: profile } = await supabase.from('instructor_profiles').select('*').eq('user_id', id).single();
  const { data: courses } = await supabase.from('courses').select('id, title, category, sub_category, subject, thumbnail_url, duration_seconds, view_count').eq('instructor_id', id).eq('is_published', true).order('created_at', { ascending: false });
  const totalCourses = (courses || []).length;
  const totalViews = (courses || []).reduce((s: number, c: any) => s + (c.view_count || 0), 0);
  return NextResponse.json({ success: true, data: { instructor: { ...user, bio: profile?.bio || user.bio || null, specialties: profile?.specialties || [], education: profile?.education || null, experience: profile?.experience || null }, courses: courses || [], stats: { total_courses: totalCourses, total_views: totalViews } } });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  if (session.user.id !== id && session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  const { bio, specialties, education, experience, avatar_url } = await request.json();
  const supabase = createSupabaseAdmin();
  if (bio !== undefined || avatar_url !== undefined) await supabase.from('users').update({ ...(bio !== undefined && { bio }), ...(avatar_url !== undefined && { avatar_url }) }).eq('id', id);
  await supabase.from('instructor_profiles').upsert({ user_id: id, bio: bio || null, specialties: specialties || [], education: education || null, experience: experience || null, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return NextResponse.json({ success: true });
}
