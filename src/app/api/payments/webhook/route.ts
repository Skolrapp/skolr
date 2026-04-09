import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentWebhook } from '@/lib/payments';
import { createHmac } from 'crypto';

function verifyFlw(payload: string, sig: string) {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET || '';
  if (!secret) return true; // skip in demo mode
  return createHmac('sha256', secret).update(payload).digest('hex') === sig;
}

export async function POST(request: NextRequest) {
  const raw      = await request.text();
  const provider = request.nextUrl.searchParams.get('provider') || 'flutterwave';

  if (provider === 'flutterwave') {
    const sig = request.headers.get('verif-hash') || '';
    if (!verifyFlw(raw, sig)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    const body = JSON.parse(raw);
    const { data } = body as { data: { tx_ref: string; status: string; flw_ref: string } };
    const status = data.status === 'successful' ? 'success' : 'failed';
    await handlePaymentWebhook(data.tx_ref, status, data.flw_ref);
  } else if (provider === 'pesapal') {
    const body = JSON.parse(raw);
    const status = body.payment_status_description === 'Completed' ? 'success' : 'failed';
    await handlePaymentWebhook(body.merchant_reference, status, body.pesapal_transaction_tracking_id);
  }

  // Always return 200 so gateway doesn't retry
  return NextResponse.json({ received: true });
}
