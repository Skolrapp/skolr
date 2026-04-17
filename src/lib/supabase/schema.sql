-- ============================================================
--  Skolr — Supabase PostgreSQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ENUM TYPES ──────────────────────────────────────────────

create type user_role as enum ('student', 'instructor', 'admin');

create type education_level as enum (
  'primary', 'secondary', 'highschool', 'undergraduate', 'masters'
);

create type subscription_tier as enum (
  'free',
  'primary_only',
  'secondary_only',
  'primary_secondary',
  'highschool_only',
  'full_k12',
  'postgraduate'
);

create type payment_provider as enum ('mpesa', 'tigopesa', 'airtelmoney', 'card');
create type payment_status   as enum ('pending', 'success', 'failed', 'refunded');
create type billing_cycle    as enum ('monthly', 'annual');
create type course_language  as enum ('en', 'sw', 'both');

-- ─── USERS ───────────────────────────────────────────────────

create table public.users (
  id                     uuid primary key default uuid_generate_v4(),
  name                   text not null,
  phone                  text unique not null,
  account_type           text not null default 'individual' check (account_type in ('individual', 'parent_guardian')),
  email                  text unique,
  password_hash          text not null,
  role                   user_role not null default 'student',
  subscription_tier      subscription_tier not null default 'free',
  subscription_expires_at timestamptz,
  avatar_url             text,
  trial_used             boolean not null default false,
  is_active              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own data"
  on public.users for select
  using (auth.uid()::text = id::text or true);  -- adjust for your auth setup

-- ─── LEARNER PROFILES ────────────────────────────────────────

create table public.learner_profiles (
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

create index idx_learner_profiles_account on public.learner_profiles(account_user_id);
alter table public.learner_profiles enable row level security;

-- ─── DEVICES ─────────────────────────────────────────────────

create table public.user_devices (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  fingerprint text not null,
  device_name text not null,
  os          text,
  browser     text,
  ip_address  text,
  last_active timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique(user_id, fingerprint)
);

create index idx_devices_user on public.user_devices(user_id);
alter table public.user_devices enable row level security;

-- ─── SESSIONS ────────────────────────────────────────────────

create table public.user_sessions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  device_id  uuid references public.user_devices(id) on delete set null,
  ip_address text,
  is_valid   boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index idx_sessions_user  on public.user_sessions(user_id);
create index idx_sessions_token on public.user_sessions(token_hash);
create index idx_sessions_valid on public.user_sessions(user_id, is_valid);
alter table public.user_sessions enable row level security;

-- ─── COURSES ─────────────────────────────────────────────────

create table public.courses (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  description      text,
  category         education_level not null,
  sub_category     text,
  subject          text not null,
  instructor_id    uuid not null references public.users(id),
  thumbnail_url    text,
  video_hls_url    text not null,
  duration_seconds integer not null default 0,
  is_published     boolean not null default false,
  language         course_language not null default 'en',
  view_count       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint valid_sub_category check (
    (category = 'primary'        and (sub_category like 'Std %'  or sub_category is null))
    or (category = 'secondary'   and sub_category in ('Form 1','Form 2','Form 3','Form 4'))
    or (category = 'highschool'  and sub_category in ('Form 5','Form 6'))
    or (category in ('undergraduate','masters') and (sub_category like 'Year %' or sub_category is null))
  )
);

create index idx_courses_category  on public.courses(category);
create index idx_courses_instructor on public.courses(instructor_id);
create index idx_courses_published on public.courses(is_published);
alter table public.courses enable row level security;
create policy "Anyone can read published courses" on public.courses for select using (is_published = true);
create policy "Instructors can manage own courses" on public.courses for all using (instructor_id::text = auth.uid()::text);

-- ─── ENROLLMENTS ─────────────────────────────────────────────

create table public.enrollments (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  learner_profile_id uuid references public.learner_profiles(id) on delete cascade,
  course_id        uuid not null references public.courses(id) on delete cascade,
  enrolled_at      timestamptz not null default now(),
  progress_seconds integer not null default 0,
  last_lesson_id   text,
  last_lesson_progress_seconds integer not null default 0,
  completed        boolean not null default false,
  completed_at     timestamptz,
  unique(user_id, learner_profile_id, course_id)
);

create index idx_enrollments_user   on public.enrollments(user_id);
create index idx_enrollments_learner on public.enrollments(learner_profile_id);
create index idx_enrollments_course on public.enrollments(course_id);
alter table public.enrollments enable row level security;

-- ─── TRANSACTIONS ────────────────────────────────────────────

create table public.transactions (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references public.users(id),
  instructor_id      uuid references public.users(id),
  subscription_tier  subscription_tier not null,
  billing_cycle      billing_cycle not null default 'monthly',
  amount             integer not null,         -- TZS
  platform_fee       integer not null,         -- 30%
  net_amount         integer not null,         -- 70%
  provider           payment_provider not null,
  provider_reference text,
  msisdn             text,
  status             payment_status not null default 'pending',
  created_at         timestamptz not null default now(),
  settled_at         timestamptz
);

create index idx_txn_user       on public.transactions(user_id);
create index idx_txn_instructor on public.transactions(instructor_id);
create index idx_txn_status     on public.transactions(status);
alter table public.transactions enable row level security;

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

create trigger trg_courses_updated_at
  before update on public.courses
  for each row execute function update_updated_at();

create trigger trg_learner_profiles_updated_at
  before update on public.learner_profiles
  for each row execute function update_updated_at();

-- ─── SEED DEMO DATA ──────────────────────────────────────────
-- Run after schema. Passwords are bcrypt hashes of the demo passwords.
-- student123 hash (cost 10):
-- $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

insert into public.users (name, phone, password_hash, role, subscription_tier) values
  ('Alex Mwanga',      '+255712000001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student',    'free'),
  ('Fatuma Hassan',    '+255712000002', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student',    'full_k12'),
  ('Dr. James Kiromo', '+255712000010', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 'free'),
  ('Prof. Sarah Ali',  '+255712000011', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 'free')
on conflict do nothing;
