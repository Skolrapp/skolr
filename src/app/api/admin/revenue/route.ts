import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const supabase = createSupabaseAdmin();
  const { data: rows, error } = await supabase
    .from('transactions')
    .select('id, amount, platform_fee, net_amount, status, billing_cycle, subscription_tier, created_at, settled_at, users!user_id(name, phone)')
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const transactions = (rows || []) as Array<{
    id: string;
    amount: number;
    platform_fee: number;
    net_amount: number;
    status: string;
    billing_cycle: string;
    subscription_tier: string;
    created_at: string;
    settled_at?: string | null;
    users?: { name?: string; phone?: string } | null;
  }>;

  const totals = transactions.reduce((acc, entry) => {
    acc.totalRevenue += entry.amount || 0;
    acc.skolrShare += entry.platform_fee || 0;
    acc.instructorPool += entry.net_amount || 0;
    acc.totalTransactions += 1;
    if (entry.billing_cycle === 'annual') acc.annualTransactions += 1;
    else acc.monthlyTransactions += 1;
    return acc;
  }, {
    totalRevenue: 0,
    skolrShare: 0,
    instructorPool: 0,
    totalTransactions: 0,
    monthlyTransactions: 0,
    annualTransactions: 0,
  });

  const split = totals.totalRevenue > 0
    ? {
        skolrPercent: (totals.skolrShare / totals.totalRevenue) * 100,
        instructorPercent: (totals.instructorPool / totals.totalRevenue) * 100,
      }
    : {
        skolrPercent: 0,
        instructorPercent: 0,
      };

  return NextResponse.json({
    success: true,
    data: {
      totals,
      split,
      transactions,
    },
  });
}
