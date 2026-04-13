import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const q = (request.nextUrl.searchParams.get('q') || '').trim();
  const status = (request.nextUrl.searchParams.get('status') || '').trim();
  const supabase = createSupabaseAdmin();

  let query = supabase
    .from('transactions')
    .select('id, amount, platform_fee, net_amount, provider, provider_reference, msisdn, status, subscription_tier, billing_cycle, created_at, settled_at, users!user_id(name, phone)')
    .order('created_at', { ascending: false })
    .limit(60);

  if (status && ['pending', 'success', 'failed', 'refunded'].includes(status)) {
    query = query.eq('status', status);
  }

  if (q) {
    const search = `%${q}%`;
    query = query.or(`provider_reference.ilike.${search},msisdn.ilike.${search}`);
  }

  const { data: transactions, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  let filtered = (transactions || []) as any[];
  if (q) {
    const normalized = q.toLowerCase();
    filtered = filtered.filter((entry) => {
      const learnerName = entry.users?.name?.toLowerCase() || '';
      const learnerPhone = entry.users?.phone?.toLowerCase() || '';
      return learnerName.includes(normalized) || learnerPhone.includes(normalized) || (entry.provider || '').toLowerCase().includes(normalized);
    });
  }

  const summary = filtered.reduce(
    (acc, entry) => {
      acc.total_amount += entry.amount || 0;
      acc.total_count += 1;
      acc[`${entry.status}_count`] += 1;
      return acc;
    },
    {
      total_amount: 0,
      total_count: 0,
      success_count: 0,
      pending_count: 0,
      failed_count: 0,
      refunded_count: 0,
    } as Record<string, number>
  );

  return NextResponse.json({
    success: true,
    data: {
      summary,
      transactions: filtered,
    },
  });
}
