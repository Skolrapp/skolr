import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { ACTIVE_LEARNER_COOKIE, setActiveLearnerCookie } from '@/lib/activeLearner';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import type { EducationLevel, ManagedLearnerProfile } from '@/types';

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

  const profileIds = (data || []).map((profile) => profile.id);
  let profilesWithStats = (data || []).map((profile) => ({
    ...profile,
    stats: {
      enrolled_courses: 0,
      completed_courses: 0,
      completion_percent: 0,
      total_progress_seconds: 0,
      last_activity_at: null,
    },
  })) as ManagedLearnerProfile[];

  if (profileIds.length) {
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('learner_profile_id, progress_seconds, completed, enrolled_at, completed_at, courses(duration_seconds)')
      .in('learner_profile_id', profileIds);

    if (enrollmentError) {
      return NextResponse.json({ success: false, error: enrollmentError.message }, { status: 500 });
    }

    const statsByProfile = new Map<string, ManagedLearnerProfile['stats']>();
    for (const entry of enrollments || []) {
      const learnerProfileId = entry.learner_profile_id as string | null;
      if (!learnerProfileId) continue;
      const durationSeconds = Number((entry.courses as { duration_seconds?: number } | null)?.duration_seconds || 0);
      const current = statsByProfile.get(learnerProfileId) || {
        enrolled_courses: 0,
        completed_courses: 0,
        completion_percent: 0,
        total_progress_seconds: 0,
        last_activity_at: null,
      };
      current.enrolled_courses += 1;
      current.total_progress_seconds += Number(entry.progress_seconds || 0);
      if (entry.completed) current.completed_courses += 1;
      current.completion_percent += durationSeconds > 0
        ? Math.min(100, Math.round((Number(entry.progress_seconds || 0) / durationSeconds) * 100))
        : 0;
      const activityAt = (entry.completed_at as string | null) || (entry.enrolled_at as string | null);
      if (activityAt && (!current.last_activity_at || activityAt > current.last_activity_at)) {
        current.last_activity_at = activityAt;
      }
      statsByProfile.set(learnerProfileId, current);
    }

    profilesWithStats = profilesWithStats.map((profile) => {
      const stats = statsByProfile.get(profile.id);
      if (!stats) return profile;
      return {
        ...profile,
        stats: {
          ...stats,
          completion_percent: stats.enrolled_courses ? Math.round(stats.completion_percent / stats.enrolled_courses) : 0,
        },
      };
    });
  }

  return NextResponse.json({
    success: true,
    data: profilesWithStats,
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

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const learnerId = request.nextUrl.searchParams.get('id');
  if (!learnerId) {
    return NextResponse.json({ success: false, error: 'Learner profile id is required.' }, { status: 400 });
  }

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
    .update({
      full_name: full_name.trim(),
      education_level,
      sub_category,
      is_minor: isMinorEducationLevel(education_level),
      guardian_name: isMinorEducationLevel(education_level) ? session.user.name : null,
      guardian_whatsapp_number: isMinorEducationLevel(education_level) ? session.user.phone : null,
      consent_confirmed_at: isMinorEducationLevel(education_level) ? new Date().toISOString() : null,
    })
    .eq('id', learnerId)
    .eq('account_user_id', session.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: 'Could not update learner profile.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const learnerId = request.nextUrl.searchParams.get('id');
  if (!learnerId) {
    return NextResponse.json({ success: false, error: 'Learner profile id is required.' }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data: existingProfiles, error: listError } = await supabase
    .from('learner_profiles')
    .select('id')
    .eq('account_user_id', session.user.id)
    .order('created_at', { ascending: true });

  if (listError) {
    return NextResponse.json({ success: false, error: listError.message }, { status: 500 });
  }

  const ownsProfile = (existingProfiles || []).some((profile) => profile.id === learnerId);
  if (!ownsProfile) {
    return NextResponse.json({ success: false, error: 'Learner profile not found on this account.' }, { status: 404 });
  }

  const { error } = await supabase
    .from('learner_profiles')
    .delete()
    .eq('id', learnerId)
    .eq('account_user_id', session.user.id);

  if (error) {
    return NextResponse.json({ success: false, error: 'Could not remove learner profile.' }, { status: 500 });
  }

  const remainingProfiles = (existingProfiles || []).filter((profile) => profile.id !== learnerId);
  const currentActiveLearnerId = request.cookies.get(ACTIVE_LEARNER_COOKIE)?.value || null;
  const nextActiveLearnerId = currentActiveLearnerId === learnerId
    ? remainingProfiles[0]?.id || null
    : currentActiveLearnerId;

  const response = NextResponse.json({ success: true, active_learner_profile_id: nextActiveLearnerId });
  setActiveLearnerCookie(response, nextActiveLearnerId);
  return response;
}
