-- ASBO — Supabase schema (canonical; mirrors migrations 0001-0003)
-- Run this in the Supabase SQL Editor of your project.

-- Events table: anonymous users can insert, only authenticated admins can read.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  type text not null,
  data jsonb not null default '{}'::jsonb,
  session_id text,
  lang text,
  created_at timestamptz not null default now()
);

create index if not exists events_type_idx on public.events (type);
create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_session_idx on public.events (session_id);

alter table public.events enable row level security;

-- Admin allow-list: only listed users can read analytics.
-- Seed it in the SQL editor: insert into public.admins (user_id) values ('<auth uid>');
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Anonymous visitors can record known events with a small payload.
drop policy if exists "anon insert events" on public.events;
create policy "anon insert events" on public.events
  for insert to anon, authenticated
  with check (
    type in ('page_view', 'guide_view', 'quiz_complete', 'checker_use',
             'checklist_update', 'lab_complete', 'outbound_click')
    and pg_column_size(data) <= 2048
    and coalesce(length(session_id), 0) <= 64
    and coalesce(length(lang), 0) <= 5
  );

-- Only admins can read events (public sign-up grants no read access).
drop policy if exists "admin read events" on public.events;
create policy "admin read events" on public.events
  for select to authenticated
  using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

-- Optional: daily aggregated view for partners/authorities.
create or replace view public.daily_stats as
select
  date_trunc('day', created_at) as day,
  type,
  count(*) as count,
  count(distinct session_id) as unique_sessions
from public.events
group by 1, 2
order by 1 desc;

-- The view must apply the caller's RLS, not its owner's.
alter view public.daily_stats set (security_invoker = true);
revoke select on public.daily_stats from anon;
