alter table public.users
  add column if not exists account_type text not null default 'individual';

alter table public.users
  drop constraint if exists users_account_type_check;

alter table public.users
  add constraint users_account_type_check
  check (account_type in ('individual', 'parent_guardian'));

create table if not exists public.learner_profiles (
  id                       uuid primary key default uuid_generate_v4(),
  account_user_id          uuid not null references public.users(id) on delete cascade,
  full_name                text not null,
  education_level          education_level not null,
  sub_category             text,
  is_minor                 boolean not null default false,
  guardian_name            text,
  guardian_whatsapp_number text,
  consent_confirmed_at     timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists idx_learner_profiles_account on public.learner_profiles(account_user_id);

alter table public.enrollments
  add column if not exists learner_profile_id uuid references public.learner_profiles(id) on delete cascade;

update public.enrollments as e
set learner_profile_id = source.id
from (
  select distinct on (account_user_id) id, account_user_id
  from public.learner_profiles
  order by account_user_id, created_at asc
) as source
where e.user_id = source.account_user_id
  and e.learner_profile_id is null;

alter table public.enrollments
  drop constraint if exists enrollments_user_id_course_id_key;

create unique index if not exists idx_enrollments_user_learner_course
  on public.enrollments(user_id, learner_profile_id, course_id);

create index if not exists idx_enrollments_learner
  on public.enrollments(learner_profile_id);

drop trigger if exists trg_learner_profiles_updated_at on public.learner_profiles;

create trigger trg_learner_profiles_updated_at
  before update on public.learner_profiles
  for each row execute function update_updated_at();
