'use server';

import { createSupabaseAdmin } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import type { EducationLevel } from '@/types';

// ─── Save watch progress ──────────────────────────────────────────────────────

export async function saveProgressAction(courseId: string, progressSeconds: number) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };

  const supabase = createSupabaseAdmin();
  const course = await supabase
    .from('courses')
    .select('duration_seconds')
    .eq('id', courseId)
    .single();

  const duration  = course.data?.duration_seconds || 0;
  const completed = duration > 0 && progressSeconds >= duration * 0.95;

  await supabase
    .from('enrollments')
    .upsert({
      id:               uuidv4(),
      user_id:          user.id,
      course_id:        courseId,
      progress_seconds: progressSeconds,
      completed,
      completed_at:     completed ? new Date().toISOString() : null,
    }, { onConflict: 'user_id,course_id' });

  return { success: true };
}

// ─── Upload course (instructor only) ─────────────────────────────────────────

export async function uploadCourseAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return { error: 'Only instructors can upload courses.' };
  }

  const title       = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const category    = formData.get('category') as EducationLevel;
  const sub         = (formData.get('sub_category') as string) || null;
  const subject     = formData.get('subject') as string;
  const hlsUrl      = (formData.get('video_hls_url') as string)?.trim();
  const thumbUrl    = (formData.get('thumbnail_url') as string)?.trim() || null;
  const duration    = parseInt(formData.get('duration_seconds') as string) || 0;
  const language    = (formData.get('language') as string) || 'en';

  if (!title)    return { error: 'Title is required.' };
  if (!category) return { error: 'Education level is required.' };
  if (!subject)  return { error: 'Subject is required.' };
  if (!hlsUrl || !hlsUrl.endsWith('.m3u8')) return { error: 'A valid .m3u8 HLS URL is required.' };

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('courses')
    .insert({
      id:              uuidv4(),
      title,
      description,
      category,
      sub_category:    sub,
      subject,
      instructor_id:   user.id,
      thumbnail_url:   thumbUrl,
      video_hls_url:   hlsUrl,
      duration_seconds: duration,
      language,
      is_published:    false,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, courseId: data.id, title: data.title };
}
