import { v4 as uuidv4 } from 'uuid';
import { createSupabaseAdmin } from '@/lib/supabase/server';
import { getActiveLearnerFromCookies } from '@/lib/activeLearner';
import type { User } from '@/types';

type SaveProgressOptions = {
  lessonId?: string | null;
  lessonProgressSeconds?: number;
};

export async function saveCourseProgressForUser(user: User, courseId: string, progressSeconds: number, options: SaveProgressOptions = {}) {
  const { activeLearner } = await getActiveLearnerFromCookies(user);
  const supabase = createSupabaseAdmin();

  const courseResult = await supabase
    .from('courses')
    .select('duration_seconds')
    .eq('id', courseId)
    .single();

  if (courseResult.error) {
    return { success: false as const, error: courseResult.error.message };
  }

  const duration = courseResult.data?.duration_seconds || 0;
  const completed = duration > 0 && progressSeconds >= duration * 0.95;

  let existingQuery = supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false })
    .limit(1);

  if (activeLearner?.id) {
    existingQuery = existingQuery.eq('learner_profile_id', activeLearner.id);
  } else {
    existingQuery = existingQuery.is('learner_profile_id', null);
  }

  const existingResult = await existingQuery.maybeSingle();
  if (existingResult.error) {
    return { success: false as const, error: existingResult.error.message };
  }

  if (existingResult.data?.id) {
    const updateResult = await supabase
      .from('enrollments')
      .update({
        progress_seconds: progressSeconds,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        last_lesson_id: options.lessonId || null,
        last_lesson_progress_seconds: Math.max(0, Math.floor(options.lessonProgressSeconds ?? progressSeconds)),
      })
      .eq('id', existingResult.data.id);

    if (updateResult.error) {
      return { success: false as const, error: updateResult.error.message };
    }

    return { success: true as const };
  }

  const insertResult = await supabase
    .from('enrollments')
    .insert({
      id: uuidv4(),
      user_id: user.id,
      learner_profile_id: activeLearner?.id || null,
      course_id: courseId,
      progress_seconds: progressSeconds,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      last_lesson_id: options.lessonId || null,
      last_lesson_progress_seconds: Math.max(0, Math.floor(options.lessonProgressSeconds ?? progressSeconds)),
    });

  if (insertResult.error) {
    return { success: false as const, error: insertResult.error.message };
  }

  return { success: true as const };
}
