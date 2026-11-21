-- Sécurité — Supabase schema
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

-- Anyone (anonymous visitors) can record an event.
drop policy if exists "anon insert events" on public.events;
create policy "anon insert events" on public.events
  for insert to anon, authenticated
  with check (true);

-- Only signed-in users (the admin account) can read statistics.
drop policy if exists "admin read events" on public.events;
create policy "admin read events" on public.events
  for select to authenticated
  using (true);

-- Restrict which authenticated user can read: only the admin email.
-- (Adjust the email to your admin account.)
-- drop policy if exists "admin only read" on public.events;
-- create policy "admin only read" on public.events
--   for select to authenticated
--   using ((select auth.jwt() ->> 'email') = 'admin@example.com');

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
