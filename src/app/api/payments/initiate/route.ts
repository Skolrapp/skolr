import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { initiatePayment } from '@/lib/payments';
import { BUNDLE_MAP } from '@/lib/subscriptions';
import type { SubscriptionTier, PaymentProvider, BillingCycle } from '@/types';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { tier, cycle = 'monthly', provider, msisdn } = await request.json() as {
    tier: SubscriptionTier; cycle?: BillingCycle; provider: PaymentProvider; msisdn: string;
  };

  if (!tier || !provider || !msisdn) {
    return NextResponse.json({ success: false, error: 'tier, provider, and msisdn are required.' }, { status: 400 });
  }

  const bundle = BUNDLE_MAP[tier];
  if (!bundle) return NextResponse.json({ success: false, error: 'Invalid subscription tier.' }, { status: 400 });

  let phone = msisdn.replace(/\s/g, '');
  if (phone.startsWith('0')) phone = '+255' + phone.slice(1);
  if (!phone.startsWith('+255')) phone = '+255' + phone;

  const amount = cycle === 'annual' ? bundle.price_annual : bundle.price_monthly;

  const result = await initiatePayment({
    userId:   session.user.id,
    tier,
    cycle,
    amount,
    msisdn:   phone,
    provider,
  });

  return NextResponse.json(
    { success: result.success, data: { ...result, amount, tier, cycle, bundle: bundle.name }, error: result.success ? undefined : result.message },
    { status: result.success ? 200 : 402 }
  );
}
