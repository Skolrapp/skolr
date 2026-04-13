-- ============================================================
--  Skolr — Course Review Workflow
--  Run this in: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

do $$ begin
  create type public.course_review_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.course_review_requests (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null unique references public.courses(id) on delete cascade,
  instructor_id uuid not null references public.users(id) on delete cascade,
  status public.course_review_status not null default 'pending',
  admin_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_course_review_requests_status on public.course_review_requests(status);
create index if not exists idx_course_review_requests_course on public.course_review_requests(course_id);
create index if not exists idx_course_review_requests_instructor on public.course_review_requests(instructor_id);

alter table public.course_review_requests enable row level security;

drop policy if exists "Admins can manage course review requests" on public.course_review_requests;
create policy "Admins can manage course review requests"
  on public.course_review_requests for all
  using (true);

drop policy if exists "Instructors can read own course review requests" on public.course_review_requests;
create policy "Instructors can read own course review requests"
  on public.course_review_requests for select
  using (instructor_id::text = auth.uid()::text);
