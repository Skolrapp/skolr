import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  if (!token) return NextResponse.json({ success: false, error: 'Not authenticated', code: 'NO_TOKEN' }, { status: 401 });
  const result = await validateSession(token);
  if (!result) {
    const res = NextResponse.json({ success: false, error: 'Session expired.', code: 'SESSION_INVALID' }, { status: 401 });
    res.cookies.delete('sk_token');
    return res;
  }
  const { user } = result;
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, subscription_tier: user.subscription_tier, subscription_expires_at: user.subscription_expires_at } });
}
