grant select, insert, delete on table public.prayers to authenticated;

alter table public.prayers enable row level security;

drop policy if exists prayers_select_own on public.prayers;
create policy prayers_select_own
  on public.prayers
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists prayers_insert_own on public.prayers;
create policy prayers_insert_own
  on public.prayers
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists prayers_delete_own on public.prayers;
create policy prayers_delete_own
  on public.prayers
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
