grant select, insert, update on table public.cic_progress to authenticated;

alter table public.cic_progress enable row level security;

drop policy if exists cic_progress_select_own on public.cic_progress;
create policy cic_progress_select_own
  on public.cic_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists cic_progress_insert_own on public.cic_progress;
create policy cic_progress_insert_own
  on public.cic_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists cic_progress_update_own on public.cic_progress;
create policy cic_progress_update_own
  on public.cic_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
