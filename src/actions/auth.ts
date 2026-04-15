'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { createSession, invalidateSession } from '@/lib/auth';
import type { EducationLevel, SubCategory } from '@/types';

function normalizeTzPhone(rawPhone: string) {
  const compact = rawPhone.replace(/\s/g, '');
  if (compact.startsWith('+255')) return compact;
  if (compact.startsWith('255')) return `+${compact}`;
  if (compact.startsWith('0')) return `+255${compact.slice(1)}`;
  return `+255${compact}`;
}

function isMinorEducationLevel(level: EducationLevel) {
  return level === 'primary' || level === 'secondary' || level === 'highschool';
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'student';
  const learnerName = (formData.get('learner_name') as string)?.trim();
  const learnerLevel = (formData.get('learner_level') as EducationLevel | null) || 'primary';
  const learnerSubCategory = ((formData.get('learner_sub_category') as string)?.trim() || null) as SubCategory;
  const guardianConsent = formData.get('guardian_consent') === 'yes';

  if (!name || !phone || !password || password.length < 6) {
    return { error: 'Please fill in all fields. Password must be at least 6 characters.' };
  }

  const normalized = normalizeTzPhone(phone);
  const supabase   = createSupabaseAdmin();

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', normalized)
    .single();

  if (existing) return { error: 'This phone number is already registered.' };

  const passwordHash = await bcrypt.hash(password, 12);

  const isStudentFlow = role === 'student';
  const isMinorFlow = isStudentFlow && isMinorEducationLevel(learnerLevel);

  if (isStudentFlow && !learnerName) {
    return { error: isMinorFlow ? 'Learner name is required for parent-managed signup.' : 'Learner name is required.' };
  }

  if (isMinorFlow && !guardianConsent) {
    return { error: 'Parent or guardian consent is required for learners under 18.' };
  }

  if (!isMinorFlow && isStudentFlow && (learnerLevel === 'undergraduate' || learnerLevel === 'masters') && !learnerName) {
    return { error: 'Learner details are required.' };
  }

  const userId = uuidv4();
  const { error } = await supabase.from('users').insert({
    id: userId,
    name,
    phone: normalized,
    password_hash: passwordHash,
    role,
    account_type: isMinorFlow ? 'parent_guardian' : 'individual',
    subscription_tier: 'free',
  });

  if (error) return { error: 'Registration failed. Please try again.' };

  if (isStudentFlow) {
    const { error: learnerError } = await supabase.from('learner_profiles').insert({
      account_user_id: userId,
      full_name: learnerName || name,
      education_level: learnerLevel,
      sub_category: learnerSubCategory,
      is_minor: isMinorFlow,
      guardian_name: isMinorFlow ? name : null,
      guardian_whatsapp_number: isMinorFlow ? normalized : null,
      consent_confirmed_at: isMinorFlow ? new Date().toISOString() : null,
    });

    if (learnerError) {
      await supabase.from('users').delete().eq('id', userId);
      return { error: 'Registration failed while saving learner details. Run the parent signup SQL, then try again.' };
    }
  }

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
