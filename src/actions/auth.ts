'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { createSession, invalidateSession } from '@/lib/auth';

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(formData: FormData) {
  const name     = (formData.get('name') as string)?.trim();
  const phone    = (formData.get('phone') as string)?.trim();
  const password = formData.get('password') as string;
  const role     = (formData.get('role') as string) || 'student';

  if (!name || !password || password.length < 6) {
    return { error: 'Please fill in all fields. Password must be at least 6 characters.' };
  }

  const normalized = phone.startsWith('+255') ? phone : `+255${phone.replace(/^0/, '')}`;
  const supabase   = createSupabaseAdmin();

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', normalized)
    .single();

  if (existing) return { error: 'This phone number is already registered.' };

  const passwordHash = await bcrypt.hash(password, 12);

  const { error } = await supabase.from('users').insert({
    id:            uuidv4(),
    name,
    phone:         normalized,
    password_hash: passwordHash,
    role,
    subscription_tier: 'free',
  });

  if (error) return { error: 'Registration failed. Please try again.' };

  return { success: true };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const phone    = (formData.get('phone') as string)?.trim();
  const password = formData.get('password') as string;

  if (!phone || !password) return { error: 'Phone and password are required.' };

  const normalized = phone.startsWith('+255') ? phone : `+255${phone.replace(/^0/, '')}`;
  const supabase   = createSupabaseAdmin();

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('phone', normalized)
    .eq('is_active', true)
    .single();

  if (!user) return { error: 'Invalid phone number or password.' };

  const validPw = await bcrypt.compare(password, user.password_hash);
  if (!validPw) return { error: 'Invalid phone number or password.' };

  // Build device fingerprint from headers
  const headersList = await headers();
  const ua   = headersList.get('user-agent') || '';
  const lang = headersList.get('accept-language') || '';
  const { createHash } = await import('crypto');
  const fingerprint = createHash('sha256').update(`${ua}|${lang}`).digest('hex').substring(0, 32);

  let token: string;
  try {
    const result = await createSession(user.id, user.role, {
      fingerprint,
      deviceName: ua.substring(0, 80) || 'Browser',
      os:         '',
      browser:    '',
      ipAddress:  headersList.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0',
    });
    token = result.token;
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'DEVICE_LIMIT_EXCEEDED') {
      return { error: 'Device limit reached (max 2). Remove a device in Settings.', code: 'DEVICE_LIMIT_EXCEEDED' };
    }
    return { error: 'Login failed. Please try again.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('sk_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7,
    path:     '/',
  });

  return {
    success: true,
    role:    user.role,
    userId:  user.id,
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sk_token')?.value;
  if (token) await invalidateSession(token);
  cookieStore.delete('sk_token');
  redirect('/login');
}
