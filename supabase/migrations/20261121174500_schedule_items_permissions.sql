grant select, insert, update, delete on table public.schedule_items to authenticated;

alter table public.schedule_items enable row level security;

drop policy if exists schedule_items_select_own on public.schedule_items;
create policy schedule_items_select_own
  on public.schedule_items
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists schedule_items_insert_own on public.schedule_items;
create policy schedule_items_insert_own
  on public.schedule_items
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists schedule_items_update_own on public.schedule_items;
create policy schedule_items_update_own
  on public.schedule_items
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists schedule_items_delete_own on public.schedule_items;
create policy schedule_items_delete_own
  on public.schedule_items
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
