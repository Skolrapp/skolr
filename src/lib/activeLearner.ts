import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import type { LearnerProfile, User } from '@/types';

export const ACTIVE_LEARNER_COOKIE = 'sk_active_learner';

export async function listLearnerProfilesForUser(userId: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('learner_profiles')
    .select('*')
    .eq('account_user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as LearnerProfile[];
}

export async function resolveActiveLearnerForUser(user: User, preferredLearnerId?: string | null) {
  if (user.role !== 'student') {
    return { learnerProfiles: [] as LearnerProfile[], activeLearner: null as LearnerProfile | null };
  }

  const learnerProfiles = await listLearnerProfilesForUser(user.id);
  const activeLearner =
    learnerProfiles.find((profile) => profile.id === preferredLearnerId) ||
    learnerProfiles[0] ||
    null;

  return { learnerProfiles, activeLearner };
}

export async function getActiveLearnerFromCookies(user: User) {
  const cookieStore = await cookies();
  const preferredLearnerId = cookieStore.get(ACTIVE_LEARNER_COOKIE)?.value || null;
  return resolveActiveLearnerForUser(user, preferredLearnerId);
}

export async function getInitialLearnerProfileId(userId: string) {
  const learnerProfiles = await listLearnerProfilesForUser(userId);
  return learnerProfiles[0]?.id || null;
}

export function setActiveLearnerCookie(response: NextResponse, learnerProfileId: string | null) {
  if (!learnerProfileId) {
    response.cookies.delete(ACTIVE_LEARNER_COOKIE);
    return;
  }

  response.cookies.set(ACTIVE_LEARNER_COOKIE, learnerProfileId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}
