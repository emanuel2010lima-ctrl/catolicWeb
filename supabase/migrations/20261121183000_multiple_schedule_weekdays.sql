alter table public.schedule_items
  drop constraint if exists schedule_items_day_of_week_check;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'schedule_items'
      and column_name = 'day_of_week'
      and data_type <> 'ARRAY'
  ) then
    alter table public.schedule_items
      alter column day_of_week type smallint[]
      using case
        when day_of_week is null then null
        else array[day_of_week]::smallint[]
      end;
  end if;
end;
$$;

alter table public.schedule_items
  add constraint schedule_items_day_of_week_check
  check (
    day_of_week is null
    or (
      cardinality(day_of_week) between 1 and 7
      and day_of_week <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]
    )
  );
