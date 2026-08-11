do $$
declare dup_count int;
begin
  select count(*) into dup_count from (
    select owner_id from public.teachers
    where owner_id is not null
    group by owner_id having count(*) > 1
  ) d;

  if dup_count = 0 then
    if not exists (
      select 1 from pg_indexes
      where schemaname = 'public' and indexname = 'teachers_owner_id_unique'
    ) then
      create unique index teachers_owner_id_unique
        on public.teachers (owner_id) where owner_id is not null;
    end if;
  else
    raise notice 'Skipping teachers_owner_id_unique: % owner(s) have duplicate teacher rows; reconcile manually.', dup_count;
  end if;
end $$;