import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { ACTIVE_LEARNER_COOKIE } from '@/lib/activeLearner';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import type { Course, EducationLevel, LearnerProfile, SubCategory } from '@/types';

type EnrollmentRow = {
  learner_profile_id?: string | null;
  course_id: string;
  progress_seconds?: number | null;
  completed?: boolean | null;
  enrolled_at?: string | null;
  completed_at?: string | null;
  courses?: Pick<Course, 'id' | 'title' | 'subject' | 'category' | 'sub_category' | 'thumbnail_url' | 'duration_seconds' | 'instructor_name'> | null;
};

type LearnerSnapshot = {
  id: string;
  full_name: string;
  education_level: EducationLevel;
  sub_category?: SubCategory;
  enrolled_courses: number;
  completed_courses: number;
  completion_percent: number;
  total_watch_minutes: number;
  last_activity_at: string | null;
  continue_learning: CourseProgressRow | null;
};

type CourseProgressRow = {
  course_id: string;
  title: string;
  subject: string;
  category: EducationLevel;
  sub_category?: SubCategory;
  thumbnail_url?: string | null;
  instructor_name?: string;
  progress_seconds: number;
  duration_seconds: number;
  completion_percent: number;
  completed: boolean;
  last_activity_at: string | null;
};

function toPercent(progressSeconds: number, durationSeconds: number) {
  if (!durationSeconds) return 0;
  return Math.max(0, Math.min(100, Math.round((progressSeconds / durationSeconds) * 100)));
}

function getLastActivity(entry: EnrollmentRow) {
  return (entry.completed_at as string | null) || (entry.enrolled_at as string | null) || null;
}

function normalizeCourseRows(entries: EnrollmentRow[]) {
  return entries
    .map((entry) => {
      const course = entry.courses;
      if (!course?.id) return null;

      const progressSeconds = Number(entry.progress_seconds || 0);
      const durationSeconds = Number(course.duration_seconds || 0);

      return {
        course_id: course.id,
        title: course.title || 'Untitled course',
        subject: course.subject || 'General',
        category: course.category,
        sub_category: course.sub_category || null,
        thumbnail_url: course.thumbnail_url || null,
        instructor_name: course.instructor_name || 'Skolr instructor',
        progress_seconds: progressSeconds,
        duration_seconds: durationSeconds,
        completion_percent: toPercent(progressSeconds, durationSeconds),
        completed: !!entry.completed,
        last_activity_at: getLastActivity(entry),
      } as CourseProgressRow;
    })
    .filter(Boolean) as CourseProgressRow[];
}

function buildLearnerSnapshot(profile: LearnerProfile, enrollments: EnrollmentRow[]): LearnerSnapshot {
  const courseRows = normalizeCourseRows(enrollments);
  const continueLearning = courseRows
    .filter((row) => !row.completed && row.progress_seconds > 0)
    .sort((a, b) => {
      const aTs = a.last_activity_at ? +new Date(a.last_activity_at) : 0;
      const bTs = b.last_activity_at ? +new Date(b.last_activity_at) : 0;
      if (bTs !== aTs) return bTs - aTs;
      return b.progress_seconds - a.progress_seconds;
    })[0] || null;

  const enrolledCourses = courseRows.length;
  const completedCourses = courseRows.filter((row) => row.completed).length;
  const completionPercent = enrolledCourses
    ? Math.round(courseRows.reduce((sum, row) => sum + row.completion_percent, 0) / enrolledCourses)
    : 0;
  const totalWatchMinutes = Math.round(courseRows.reduce((sum, row) => sum + row.progress_seconds, 0) / 60);
  const lastActivityAt = courseRows
    .map((row) => row.last_activity_at)
    .filter(Boolean)
    .sort((a, b) => +new Date(b as string) - +new Date(a as string))[0] || null;

  return {
    id: profile.id,
    full_name: profile.full_name,
    education_level: profile.education_level,
    sub_category: profile.sub_category || null,
    enrolled_courses: enrolledCourses,
    completed_courses: completedCourses,
    completion_percent: completionPercent,
    total_watch_minutes: totalWatchMinutes,
    last_activity_at: lastActivityAt,
    continue_learning: continueLearning,
  };
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sk_token')?.value;
  const session = token ? await validateSession(token) : null;

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  const isParentAccount = session.user.account_type === 'parent_guardian';

  if (isParentAccount) {
    const { data: learnerProfiles, error: learnerError } = await supabase
      .from('learner_profiles')
      .select('id, full_name, education_level, sub_category, created_at, updated_at, account_user_id, is_minor, guardian_name, guardian_whatsapp_number, consent_confirmed_at')
      .eq('account_user_id', session.user.id)
      .order('created_at', { ascending: true });

    if (learnerError) {
      return NextResponse.json({ success: false, error: learnerError.message }, { status: 500 });
    }

    const profiles = (learnerProfiles || []) as LearnerProfile[];
    const learnerIds = profiles.map((profile) => profile.id);
    const activeLearnerProfileId = request.cookies.get(ACTIVE_LEARNER_COOKIE)?.value || null;

    const { data: enrollments, error: enrollmentsError } = learnerIds.length
      ? await supabase
          .from('enrollments')
          .select('learner_profile_id, course_id, progress_seconds, completed, enrolled_at, completed_at, courses(id, title, subject, category, sub_category, thumbnail_url, duration_seconds, instructor_name)')
          .in('learner_profile_id', learnerIds)
      : { data: [] as EnrollmentRow[], error: null };

    if (enrollmentsError) {
      return NextResponse.json({ success: false, error: enrollmentsError.message }, { status: 500 });
    }

    const byLearner = new Map<string, EnrollmentRow[]>();
    ((enrollments || []) as EnrollmentRow[]).forEach((entry) => {
      const learnerId = entry.learner_profile_id || '';
      if (!learnerId) return;
      const current = byLearner.get(learnerId) || [];
      current.push(entry);
      byLearner.set(learnerId, current);
    });

    const learnerSnapshots = profiles.map((profile) => buildLearnerSnapshot(profile, byLearner.get(profile.id) || []));
    const activeLearnerSnapshot = learnerSnapshots.find((snapshot) => snapshot.id === activeLearnerProfileId) || learnerSnapshots[0] || null;
    const overallCourses = learnerSnapshots.reduce((sum, snapshot) => sum + snapshot.enrolled_courses, 0);
    const overallCompletedCourses = learnerSnapshots.reduce((sum, snapshot) => sum + snapshot.completed_courses, 0);
    const overallWatchMinutes = learnerSnapshots.reduce((sum, snapshot) => sum + snapshot.total_watch_minutes, 0);
    const averageCompletionPercent = learnerSnapshots.length
      ? Math.round(learnerSnapshots.reduce((sum, snapshot) => sum + snapshot.completion_percent, 0) / learnerSnapshots.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        account_type: 'parent_guardian',
        summary: {
          learners_count: learnerSnapshots.length,
          active_courses: overallCourses,
          completed_courses: overallCompletedCourses,
          total_watch_minutes: overallWatchMinutes,
          average_completion_percent: averageCompletionPercent,
        },
        active_learner: activeLearnerSnapshot,
        learner_snapshots: learnerSnapshots,
      },
    });
  }

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('course_id, progress_seconds, completed, enrolled_at, completed_at, courses(id, title, subject, category, sub_category, thumbnail_url, duration_seconds, instructor_name)')
    .eq('user_id', session.user.id)
    .order('enrolled_at', { ascending: false });

  if (enrollmentsError) {
    return NextResponse.json({ success: false, error: enrollmentsError.message }, { status: 500 });
  }

  const courseProgress = normalizeCourseRows((enrollments || []) as EnrollmentRow[])
    .sort((a, b) => {
      const aTs = a.last_activity_at ? +new Date(a.last_activity_at) : 0;
      const bTs = b.last_activity_at ? +new Date(b.last_activity_at) : 0;
      if (bTs !== aTs) return bTs - aTs;
      return b.progress_seconds - a.progress_seconds;
    });

  const continueLearning = courseProgress.find((row) => !row.completed && row.progress_seconds > 0) || courseProgress.find((row) => !row.completed) || null;
  const completedCourses = courseProgress.filter((row) => row.completed).length;
  const totalWatchMinutes = Math.round(courseProgress.reduce((sum, row) => sum + row.progress_seconds, 0) / 60);
  const averageCompletionPercent = courseProgress.length
    ? Math.round(courseProgress.reduce((sum, row) => sum + row.completion_percent, 0) / courseProgress.length)
    : 0;
  const topSubject = courseProgress.reduce<Record<string, number>>((acc, row) => {
    acc[row.subject] = (acc[row.subject] || 0) + row.progress_seconds;
    return acc;
  }, {});
  const focusSubject = Object.entries(topSubject).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return NextResponse.json({
    success: true,
    data: {
      account_type: 'individual',
      summary: {
        active_courses: courseProgress.length,
        completed_courses: completedCourses,
        total_watch_minutes: totalWatchMinutes,
        average_completion_percent: averageCompletionPercent,
        focus_subject: focusSubject,
      },
      continue_learning: continueLearning,
      course_progress: courseProgress,
    },
  });
}
