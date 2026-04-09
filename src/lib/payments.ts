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

// ─── Flutterwave ──────────────────────────────────────────────────────────────

async function initiateFlutterwave(params: {
  userId: string;
  tier: SubscriptionTier;
  cycle: BillingCycle;
  amount: number;
  msisdn: string;
  provider: PaymentProvider;
  txRef: string;
}): Promise<{ success: boolean; message: string; providerRef?: string }> {
  const FLW = process.env.FLUTTERWAVE_SECRET_KEY;

  if (!FLW) {
    // Demo / sandbox mode when not configured
    return {
      success: true,
      message: 'Demo mode: payment simulated. Configure FLUTTERWAVE_SECRET_KEY for live payments.',
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
    return {
      success: data.status === 'success',
      message: data.status === 'success'
        ? 'Check your phone — a payment prompt has been sent. Enter your PIN to confirm.'
        : (data.message || 'Payment initiation failed.'),
      providerRef: data.data?.flw_ref,
    };
  } catch {
    return { success: false, message: 'Payment service temporarily unavailable.' };
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
}): Promise<{ success: boolean; message: string; redirectUrl?: string; providerRef?: string }> {
  const KEY    = process.env.PESAPAL_CONSUMER_KEY;
  const SECRET = process.env.PESAPAL_CONSUMER_SECRET;

  if (!KEY || !SECRET) {
    return {
      success: true,
      message: 'Demo mode: Pesapal not configured. Configure PESAPAL_* env vars for live.',
      providerRef: `DEMO-PP-${Date.now()}`,
    };
  }

  // Full Pesapal IPN flow implementation goes here.
  // See: https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json
  return {
    success: false,
    message: 'Pesapal integration pending — configure credentials.',
  };
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

  let result: { success: boolean; message: string; providerRef?: string };

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
      provider_reference: result.providerRef || txRef,
      msisdn:            params.msisdn,
      status:            result.success ? 'pending' : 'failed',
    })
    .select()
    .single();

  return {
    success:       result.success,
    transactionId: txn?.id || uuidv4(),
    message:       result.message,
    requiresAction: result.success,
  };
}

// ─── Webhook — called by Flutterwave/Pesapal after user pays ──────────────────

export async function handlePaymentWebhook(
  txRef: string,
  status: 'success' | 'failed',
  providerRef: string
): Promise<void> {
  const supabase = createSupabaseAdmin();

  // Update transaction status
  const { data: txn } = await supabase
    .from('transactions')
    .update({
      status:             status,
      provider_reference: providerRef,
      settled_at:         status === 'success' ? new Date().toISOString() : null,
    })
    .eq('provider_reference', txRef)
    .select()
    .single();

  if (!txn || status !== 'success') return;

  // Activate subscription for the user
  const expiry = getExpiryDate(txn.billing_cycle as BillingCycle);

  await supabase
    .from('users')
    .update({
      subscription_tier:       txn.subscription_tier,
      subscription_expires_at: expiry.toISOString(),
    })
    .eq('id', txn.user_id);
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
