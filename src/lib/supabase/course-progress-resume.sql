alter table public.enrollments
  add column if not exists last_lesson_id text;

alter table public.enrollments
  add column if not exists last_lesson_progress_seconds integer not null default 0;
