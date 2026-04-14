alter table public.course_resources
  add column if not exists chapter_id uuid references public.chapters(id) on delete set null,
  add column if not exists storage_bucket text,
  add column if not exists storage_path text,
  add column if not exists mime_type text,
  add column if not exists file_size_bytes bigint;

create index if not exists idx_course_resources_course_created_at
  on public.course_resources (course_id, created_at desc);

create index if not exists idx_course_resources_chapter_id
  on public.course_resources (chapter_id);
