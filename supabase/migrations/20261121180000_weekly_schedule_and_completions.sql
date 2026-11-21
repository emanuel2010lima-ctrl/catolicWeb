alter table public.schedule_items
  add column if not exists day_of_week smallint;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'schedule_items_day_of_week_check'
      and conrelid = 'public.schedule_items'::regclass
  ) then
    alter table public.schedule_items
      add constraint schedule_items_day_of_week_check
      check (day_of_week between 0 and 6);
  end if;
end;
$$;

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

create table if not exists public.schedule_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  schedule_item_id text not null,
  completion_date date not null,
  completed boolean not null default true,
  primary key (user_id, schedule_item_id, completion_date)
);

grant select, insert, update, delete on table public.schedule_completions to authenticated;

alter table public.schedule_completions enable row level security;

drop policy if exists schedule_completions_select_own on public.schedule_completions;
create policy schedule_completions_select_own
  on public.schedule_completions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists schedule_completions_insert_own on public.schedule_completions;
create policy schedule_completions_insert_own
  on public.schedule_completions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists schedule_completions_update_own on public.schedule_completions;
create policy schedule_completions_update_own
  on public.schedule_completions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists schedule_completions_delete_own on public.schedule_completions;
create policy schedule_completions_delete_own
  on public.schedule_completions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
