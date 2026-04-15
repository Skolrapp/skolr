/**
 * SERVER-ONLY — do not import in client components.
 * Payment gateway integration: Flutterwave + Pesapal.
 */
import { createSupabaseAdmin } from './supabase/server';
import { getExpiryDate } from './subscriptions';
import { BUNDLE_MAP } from './subscriptions';
import { PLATFORM_FEE_RATE } from './constants';
import { v4 as uuidv4 } from 'uuid';
import type { PaymentProvider, SubscriptionTier, BillingCycle, Transaction } from '@/types';

type GatewayInitiationResult = {
  success: boolean;
  status: 'pending' | 'success' | 'failed';
  message: string;
  providerRef?: string;
};

async function activateUserSubscription(userId: string, tier: SubscriptionTier, cycle: BillingCycle) {
  const supabase = createSupabaseAdmin();
  const expiry = getExpiryDate(cycle);

  await supabase
    .from('users')
    .update({
      subscription_tier: tier,
      subscription_expires_at: expiry.toISOString(),
    })
    .eq('id', userId);
}

// ─── Flutterwave ──────────────────────────────────────────────────────────────

async function initiateFlutterwave(params: {
  userId: string;
  tier: SubscriptionTier;
  cycle: BillingCycle;
  amount: number;
  msisdn: string;
  provider: PaymentProvider;
  txRef: string;
}): Promise<GatewayInitiationResult> {
  const FLW = process.env.FLUTTERWAVE_SECRET_KEY;

  if (!FLW) {
    // Demo / sandbox mode when not configured
    return {
      success: true,
      status: 'success',
      message: 'Demo mode: payment simulated and subscription activated. Configure FLUTTERWAVE_SECRET_KEY for live payments.',
      providerRef: `DEMO-${Date.now()}`,
    };
  }

  const providerMap: Record<string, string> = {
    mpesa: 'MPESA', tigopesa: 'TIGO', airtelmoney: 'AIRTEL',
  };

  try {
    const res = await fetch('https://api.flutterwave.com/v3/charges?type=mobile_money_tanzania', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${FLW}` },
      body: JSON.stringify({
        phone_number: params.msisdn.replace('+', ''),
        amount:       params.amount,
        currency:     'TZS',
        network:      providerMap[params.provider] || 'MPESA',
        tx_ref:       params.txRef,
        email:        `user-${params.userId}@skolr.tz`,
        fullname:     `Skolr ${BUNDLE_MAP[params.tier]?.name || ''} ${params.cycle}`,
      }),
    });
    const data = await res.json();
    const accepted = res.ok && data.status === 'success';
    return {
      success: accepted,
      status: accepted ? 'pending' : 'failed',
      message: accepted
        ? 'Check your phone — a payment prompt has been sent. Enter your PIN to confirm.'
        : (data.message || 'Payment initiation failed.'),
      providerRef: data.data?.flw_ref,
    };
  } catch {
    return { success: false, status: 'failed', message: 'Payment service temporarily unavailable.' };
  }
}

// ─── Pesapal ──────────────────────────────────────────────────────────────────

async function initiatePesapal(params: {
  userId: string;
  tier: SubscriptionTier;
  cycle: BillingCycle;
  amount: number;
  msisdn: string;
  txRef: string;
}): Promise<GatewayInitiationResult & { redirectUrl?: string }> {
  const KEY    = process.env.PESAPAL_CONSUMER_KEY;
  const SECRET = process.env.PESAPAL_CONSUMER_SECRET;

  if (!KEY || !SECRET) {
    return {
      success: true,
      status: 'success',
      message: 'Demo mode: Pesapal not configured. Configure PESAPAL_* env vars for live.',
      providerRef: `DEMO-PP-${Date.now()}`,
    };
  }

  // Full Pesapal IPN flow implementation goes here.
  // See: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json
  return {
    success: false,
    status: 'failed',
    message: 'Pesapal integration pending — configure credentials.',
  };
}

async function verifyFlutterwavePayment(params: {
  transactionId?: number | string | null;
  txRef: string;
  expectedAmount: number;
  expectedCurrency: string;
}) {
  const FLW = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!FLW) {
    return { verified: true, providerRef: null as string | null };
  }

  const endpoint = params.transactionId
    ? `https://api.flutterwave.com/v3/transactions/${params.transactionId}/verify`
    : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(params.txRef)}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FLW}`,
      },
      cache: 'no-store',
    });

    const payload = await res.json();
    const data = payload?.data;
    const chargedAmount = Number(data?.charged_amount ?? data?.amount ?? 0);
    const normalizedCurrency = String(data?.currency || '').toUpperCase();
    const normalizedStatus = String(data?.status || '').toLowerCase();
    const matches =
      res.ok &&
      payload?.status === 'success' &&
      data?.tx_ref === params.txRef &&
      normalizedStatus === 'successful' &&
      normalizedCurrency === params.expectedCurrency.toUpperCase() &&
      chargedAmount >= params.expectedAmount;

    return {
      verified: matches,
      providerRef: (data?.flw_ref as string | null) || null,
    };
  } catch {
    return { verified: false, providerRef: null as string | null };
  }
}

// ─── Unified initiator ────────────────────────────────────────────────────────

export async function initiatePayment(params: {
  userId: string;
  tier: SubscriptionTier;
  cycle: BillingCycle;
  amount: number;
  msisdn: string;
  provider: PaymentProvider;
}): Promise<{ success: boolean; transactionId: string; message: string; requiresAction: boolean }> {
  const txRef = `SKR-${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
  const gateway = process.env.PAYMENT_PROVIDER || 'flutterwave';
  const fee = Math.round(params.amount * PLATFORM_FEE_RATE);

  let result: GatewayInitiationResult;

  if (gateway === 'pesapal') {
    result = await initiatePesapal({ ...params, txRef });
  } else {
    result = await initiateFlutterwave({ ...params, txRef });
  }

  // Record transaction in Supabase
  const supabase = createSupabaseAdmin();
  const { data: txn } = await supabase
    .from('transactions')
    .insert({
      user_id:           params.userId,
      subscription_tier: params.tier,
      billing_cycle:     params.cycle,
      amount:            params.amount,
      platform_fee:      fee,
      net_amount:        params.amount - fee,
      provider:          params.provider,
      provider_reference: txRef,
      msisdn:            params.msisdn,
      status:            result.status,
      settled_at:        result.status === 'success' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (result.status === 'success') {
    await activateUserSubscription(params.userId, params.tier, params.cycle);
  }

  return {
    success:       result.success,
    transactionId: txn?.id || uuidv4(),
    message:       result.message,
    requiresAction: result.status === 'pending',
  };
}

// ─── Webhook — called by Flutterwave/Pesapal after user pays ──────────────────

export async function handlePaymentWebhook(
  txRef: string,
  status: 'pending' | 'success' | 'failed',
  _providerRef: string,
  flutterwaveTransactionId?: number | string | null
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { data: existingTxn } = await supabase
    .from('transactions')
    .select('*')
    .eq('provider_reference', txRef)
    .single();

  const txn = existingTxn as Transaction | null;
  if (!txn) return;

  if (status === 'pending') {
    await supabase
      .from('transactions')
      .update({ status: 'pending' })
      .eq('id', txn.id);
    return;
  }

  let finalStatus: 'success' | 'failed' = status;
  let settledAt: string | null = null;

  if (status === 'success' && (process.env.PAYMENT_PROVIDER || 'flutterwave') === 'flutterwave') {
    const verification = await verifyFlutterwavePayment({
      transactionId: flutterwaveTransactionId,
      txRef,
      expectedAmount: txn.amount,
      expectedCurrency: 'TZS',
    });
    finalStatus = verification.verified ? 'success' : 'failed';
    settledAt = verification.verified ? new Date().toISOString() : null;
  }

  await supabase
    .from('transactions')
    .update({
      status: finalStatus,
      settled_at: settledAt,
    })
    .eq('id', txn.id);

  if (finalStatus !== 'success') return;

  await activateUserSubscription(txn.user_id, txn.subscription_tier, txn.billing_cycle as BillingCycle);
}

// ─── Instructor earnings ──────────────────────────────────────────────────────

export async function getInstructorEarnings(
  instructorId: string,
  period: 'month' | 'quarter' | 'year' = 'month'
) {
  const supabase = createSupabaseAdmin();
  const days = { month: 30, quarter: 90, year: 365 }[period];
  const since = new Date(Date.now() - days * 86400 * 1000).toISOString();

  const { data: rows } = await supabase
    .from('transactions')
    .select('*')
    .eq('instructor_id', instructorId)
    .eq('status', 'success')
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  const transactions = (rows || []) as Transaction[];
  const total_revenue  = transactions.reduce((s, r) => s + r.amount, 0);
  const platform_fee   = transactions.reduce((s, r) => s + r.platform_fee, 0);
  const net_balance    = transactions.reduce((s, r) => s + r.net_amount, 0);

  const { data: pending } = await supabase
    .from('transactions')
    .select('net_amount')
    .eq('instructor_id', instructorId)
    .eq('status', 'success')
    .is('settled_at', null);

  const pending_payout = (pending || []).reduce((s, r) => s + r.net_amount, 0);

  return { total_revenue, platform_fee, net_balance, pending_payout, transactions, period };
}
