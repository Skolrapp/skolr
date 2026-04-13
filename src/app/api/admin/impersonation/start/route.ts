import { NextRequest, NextResponse } from 'next/server';
import { signToken, validateSession, verifyToken } from '@/lib/auth';
import { createSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });
  }

  const payload = token ? await verifyToken(token) : null;
  if (!payload?.sessionId) {
    return NextResponse.json({ success: false, error: 'Admin session not found.' }, { status: 401 });
  }

  const body = await request.json() as { userId?: string };
  if (!body.userId) {
    return NextResponse.json({ success: false, error: 'Choose a user to impersonate.' }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data: targetUser, error } = await supabase
    .from('users')
    .select('id, role, is_active')
    .eq('id', body.userId)
    .single();

  if (error || !targetUser || !targetUser.is_active) {
    return NextResponse.json({ success: false, error: 'Target user not found.' }, { status: 404 });
  }

  const impersonationToken = await signToken({
    userId: targetUser.id,
    role: targetUser.role,
    sessionId: payload.sessionId,
    impersonatedBy: session.user.id,
    adminSessionId: payload.sessionId,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set('sk_admin_token', token!, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
  res.cookies.set('sk_token', impersonationToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 8, path: '/' });
  return res;
}
