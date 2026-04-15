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

  const q = (request.nextUrl.searchParams.get('q') || '').trim();
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from('users')
    .select('id, name, phone, role, account_type, is_active, subscription_tier, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (q) {
    const search = `%${q}%`;
    query = query.or(`name.ilike.${search},phone.ilike.${search}`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data || [] });
}
