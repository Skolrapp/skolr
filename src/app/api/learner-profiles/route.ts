import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { ACTIVE_LEARNER_COOKIE, setActiveLearnerCookie } from '@/lib/activeLearner';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import type { EducationLevel } from '@/types';

function isMinorEducationLevel(level: EducationLevel) {
  return level === 'primary' || level === 'secondary' || level === 'highschool';
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('learner_profiles')
    .select('*')
    .eq('account_user_id', session.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    active_learner_profile_id: request.cookies.get(ACTIVE_LEARNER_COOKIE)?.value || null,
  });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const { full_name, education_level, sub_category = null } = await request.json() as {
    full_name: string;
    education_level: EducationLevel;
    sub_category?: string | null;
  };

  if (!full_name?.trim() || !education_level) {
    return NextResponse.json({ success: false, error: 'Learner name and level are required.' }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('learner_profiles')
    .insert({
      account_user_id: session.user.id,
      full_name: full_name.trim(),
      education_level,
      sub_category,
      is_minor: isMinorEducationLevel(education_level),
      guardian_name: isMinorEducationLevel(education_level) ? session.user.name : null,
      guardian_whatsapp_number: isMinorEducationLevel(education_level) ? session.user.phone : null,
      consent_confirmed_at: isMinorEducationLevel(education_level) ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: 'Could not save learner profile. Run the parent signup SQL, then try again.' }, { status: 500 });
  }

  const response = NextResponse.json({ success: true, data }, { status: 201 });
  if (!request.cookies.get(ACTIVE_LEARNER_COOKIE)?.value) {
    setActiveLearnerCookie(response, data.id);
  }
  return response;
}
