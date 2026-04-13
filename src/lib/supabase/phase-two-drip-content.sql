-- ============================================================
--  Skolr — Phase Two Drip Content
--  Run this in: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

alter table public.chapters
  add column if not exists release_at timestamptz;

create index if not exists idx_chapters_release_at
  on public.chapters(release_at);
