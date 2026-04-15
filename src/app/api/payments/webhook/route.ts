import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentWebhook } from '@/lib/payments';
import { createHmac, timingSafeEqual } from 'crypto';

function verifyFlw(payload: string, sig: string) {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET || '';
  if (!secret) return true; // skip in demo mode
  if (!sig) return false;

  const legacyHeaderMatch = sig === secret;
  const hmacDigest = createHmac('sha256', secret).update(payload).digest('hex');
  const hmacHeaderMatch = sig.length === hmacDigest.length && timingSafeEqual(Buffer.from(sig), Buffer.from(hmacDigest));

  return legacyHeaderMatch || hmacHeaderMatch;
}

export async function POST(request: NextRequest) {
  const raw      = await request.text();
  const provider = request.nextUrl.searchParams.get('provider') || 'flutterwave';

  if (provider === 'flutterwave') {
    const sig = request.headers.get('flutterwave-signature') || request.headers.get('verif-hash') || '';
    if (!verifyFlw(raw, sig)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    const body = JSON.parse(raw);
    const { data } = body as { data: { id?: number; tx_ref: string; status: string; flw_ref: string } };
    const normalizedStatus = String(data.status || '').toLowerCase();
    const status = normalizedStatus === 'successful'
      ? 'success'
      : normalizedStatus === 'pending'
        ? 'pending'
        : 'failed';
    await handlePaymentWebhook(data.tx_ref, status, data.flw_ref, data.id);
  } else if (provider === 'pesapal') {
    const body = JSON.parse(raw);
    const normalizedStatus = String(body.payment_status_description || '').toLowerCase();
    const status = normalizedStatus === 'completed'
      ? 'success'
      : normalizedStatus === 'pending'
        ? 'pending'
        : 'failed';
    await handlePaymentWebhook(body.merchant_reference, status, body.pesapal_transaction_tracking_id);
  }

  // Always return 200 so gateway doesn't retry
  return NextResponse.json({ received: true });
}
