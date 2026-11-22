-- ASBO — harden analytics access (security audit 2026-11-22)
--
-- Fixes found during the audit:
-- 1. Public sign-up is enabled in Supabase Auth, and the read policy allowed
--    ANY authenticated user to read every event. Reads are now limited to
--    accounts listed in public.admins (no email hard-coded: the repo is public).
-- 2. The daily_stats view ran with its owner's rights (SECURITY DEFINER
--    behaviour), bypassing RLS: anonymous visitors could read aggregates.
-- 3. Anonymous inserts were unbounded: restrict event types and payload size.

-- 1. Admin allow-list ------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- No policies on admins: only the service role / SQL editor can manage it.

-- Seed: the platform has exactly one account, created at setup (the owner).
-- Refuse to guess if that is no longer true.
do $$
begin
  if (select count(*) from auth.users) <> 1 then
    raise exception 'Expected exactly one auth user to seed public.admins; seed it manually.';
  end if;
  insert into public.admins (user_id)
  select id from auth.users
  on conflict do nothing;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "admin read events" on public.events;
create policy "admin read events" on public.events
  for select to authenticated
  using ((select public.is_admin()));

-- 2. View respects the caller's RLS -----------------------------------------
alter view public.daily_stats set (security_invoker = true);
revoke select on public.daily_stats from anon;

-- 3. Bounded anonymous inserts ---------------------------------------------
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
