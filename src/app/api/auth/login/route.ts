// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { createSession, getDeviceFingerprint } from '@/lib/auth';
import { getInitialLearnerProfileId, setActiveLearnerCookie } from '@/lib/activeLearner';

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json() as { phone: string; password: string };
    if (!phone || !password) return NextResponse.json({ success: false, error: 'Phone and password required.' }, { status: 400 });

    const normalized = phone.startsWith('+255') ? phone : `+255${phone.replace(/^0/, '')}`;
    const supabase   = createSupabaseAdmin();
    const { data: user } = await supabase.from('users').select('*').eq('phone', normalized).eq('is_active', true).single();

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ success: false, error: 'Invalid phone number or password.' }, { status: 401 });
    }

    const ua = request.headers.get('user-agent') || '';
    const fp = getDeviceFingerprint(request);

    let token: string;
    try {
      const r = await createSession(user.id, user.role, {
        fingerprint: fp,
        deviceName:  ua.substring(0, 80) || 'Browser',
        os: '', browser: '',
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0',
      });
      token = r.token;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'DEVICE_LIMIT_EXCEEDED') {
        return NextResponse.json({ success: false, error: 'Device limit reached (max 2). Remove a device in Settings.', code: 'DEVICE_LIMIT_EXCEEDED' }, { status: 403 });
      }
      throw err;
    }

    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, subscription_tier: user.subscription_tier, subscription_expires_at: user.subscription_expires_at } });
    res.cookies.set('sk_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*7, path: '/' });
    if (user.role === 'student') {
      setActiveLearnerCookie(res, await getInitialLearnerProfileId(user.id));
    }
    return res;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ success: false, error: 'Login failed.' }, { status: 500 });
  }
}
