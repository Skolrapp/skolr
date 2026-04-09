import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  if (!token || !(await validateSession(token))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const level   = searchParams.get('level');
  const sub     = searchParams.get('sub');
  const subject = searchParams.get('subject');
  const q       = searchParams.get('q');
  const page    = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const perPage = Math.min(50, parseInt(searchParams.get('per_page') || '20'));
  const from    = (page - 1) * perPage;
  const to      = from + perPage - 1;

  const supabase = createSupabaseAdmin();

  let query = supabase
    .from('courses')
    .select('*, users!instructor_id(name)', { count: 'exact' })
    .eq('is_published', true);

  if (level)   query = query.eq('category', level);
  if (sub)     query = query.eq('sub_category', sub);
  if (subject) query = query.eq('subject', subject);
  if (q)       query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  // Flatten instructor name
  const items = (data || []).map((c: Record<string, unknown> & { users?: { name: string } | null }) => ({
    ...c,
    instructor_name: c.users?.name || 'Unknown',
    users: undefined,
  }));

  // Category counts
  const { data: catRows } = await supabase
    .from('courses')
    .select('category')
    .eq('is_published', true);

  const category_counts: Record<string, number> = {};
  (catRows || []).forEach((r: { category: string }) => {
    category_counts[r.category] = (category_counts[r.category] || 0) + 1;
  });

  return NextResponse.json({
    success: true,
    data: {
      items,
      total:    count || 0,
      page,
      per_page: perPage,
      has_more: (count || 0) > to + 1,
      category_counts,
    },
  });
}
