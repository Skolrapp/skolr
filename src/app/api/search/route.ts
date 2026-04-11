import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json({ success: true, data: { courses: [], instructors: [] } });
  const supabase = createSupabaseAdmin();
  const search = `%${q}%`;
  const { data: courses } = await supabase.from('courses').select('id, title, category, sub_category, subject, thumbnail_url, users!instructor_id(id, name)').eq('is_published', true).or(`title.ilike.${search},subject.ilike.${search}`).limit(6);
  const { data: instructors } = await supabase.from('users').select('id, name, avatar_url, bio').eq('role', 'instructor').eq('is_active', true).ilike('name', search).limit(4);
  const courseResults = (courses || []).map((c: any) => ({ ...c, instructor_name: c.users?.name || 'Unknown', instructor_id: c.users?.id, users: undefined }));
  return NextResponse.json({ success: true, data: { courses: courseResults, instructors: instructors || [], query: q } });
}
