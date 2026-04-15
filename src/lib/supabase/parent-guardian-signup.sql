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

drop trigger if exists trg_learner_profiles_updated_at on public.learner_profiles;

create trigger trg_learner_profiles_updated_at
  before update on public.learner_profiles
  for each row execute function update_updated_at();
