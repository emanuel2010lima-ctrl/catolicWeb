create table if not exists public.bible_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number smallint not null check (day_number between 1 and 365),
  completed boolean not null default false,
  primary key (user_id, day_number)
);

grant select, insert, update on table public.bible_progress to authenticated;

alter table public.bible_progress enable row level security;

drop policy if exists bible_progress_select_own on public.bible_progress;
create policy bible_progress_select_own
  on public.bible_progress for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists bible_progress_insert_own on public.bible_progress;
create policy bible_progress_insert_own
  on public.bible_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists bible_progress_update_own on public.bible_progress;
create policy bible_progress_update_own
  on public.bible_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
