-- ASBO — follow-up to 0002 (Supabase advisors: SECURITY DEFINER function
-- callable through the API by anon and authenticated).
-- Replace public.is_admin() with plain RLS:
--   * a signed-in user can read only their OWN row in public.admins;
--   * events are readable when such a row exists for the caller.
-- Same access rules as 0002, without an exposed SECURITY DEFINER function.

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "admin read events" on public.events;
create policy "admin read events" on public.events
  for select to authenticated
  using (exists (select 1 from public.admins a where a.user_id = (select auth.uid())));

drop function if exists public.is_admin();
