import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { getActiveLearnerFromCookies } from '@/lib/activeLearner';

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
  const { activeLearner } = await getActiveLearnerFromCookies(user);
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      account_type: user.account_type,
      active_learner_profile_id: activeLearner?.id || null,
      active_learner_name: activeLearner?.full_name || null,
      active_learner_level: activeLearner?.education_level || null,
      active_learner_sub_category: activeLearner?.sub_category || null,
      role: user.role,
      subscription_tier: user.subscription_tier,
      subscription_expires_at: user.subscription_expires_at,
      is_impersonating: user.is_impersonating || false,
      impersonated_by: user.impersonated_by || null,
    },
  });
}
