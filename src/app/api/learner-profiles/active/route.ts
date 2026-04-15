import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { ACTIVE_LEARNER_COOKIE, resolveActiveLearnerForUser, setActiveLearnerCookie } from '@/lib/activeLearner';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const preferredLearnerId = request.cookies.get(ACTIVE_LEARNER_COOKIE)?.value || null;
  const { learnerProfiles, activeLearner } = await resolveActiveLearnerForUser(session.user, preferredLearnerId);
  const response = NextResponse.json({
    success: true,
    data: {
      learner_profiles: learnerProfiles,
      active_learner: activeLearner,
    },
  });

  if (activeLearner?.id && activeLearner.id !== preferredLearnerId) {
    setActiveLearnerCookie(response, activeLearner.id);
  }

  return response;
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { learnerProfileId } = await request.json() as { learnerProfileId?: string };
  if (!learnerProfileId) {
    return NextResponse.json({ success: false, error: 'Learner profile is required.' }, { status: 400 });
  }

  const { learnerProfiles } = await resolveActiveLearnerForUser(session.user, learnerProfileId);
  const nextActiveLearner = learnerProfiles.find((profile) => profile.id === learnerProfileId);
  if (!nextActiveLearner) {
    return NextResponse.json({ success: false, error: 'Learner profile not found on this account.' }, { status: 404 });
  }

  const response = NextResponse.json({
    success: true,
    data: {
      active_learner: nextActiveLearner,
    },
  });
  setActiveLearnerCookie(response, nextActiveLearner.id);
  return response;
}
