-- Plate-cost and brainstorm tables could be changed by anyone. Reading stays
-- open; adding, editing and deleting now needs a signed-in comp admin.
begin;

do $$
declare
  t text;
begin
  foreach t in array array[
    'plate_cost_ingredients', 'plate_cost_settings', 'plate_cost_shopping_trips',
    'plate_cost_beverage_items', 'event_brainstorm_sessions'
  ] loop
    execute format('drop policy if exists "Allow anon insert" on public.%I', t);
    execute format('drop policy if exists "Allow anon update" on public.%I', t);
    execute format('drop policy if exists "Allow anon delete" on public.%I', t);
    execute format('drop policy if exists "Allow anon select" on public.%I', t);
    execute format('create policy "anyone can read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "comp admins can insert" on public.%I for insert to authenticated with check (public.is_comp_admin())', t);
    execute format('create policy "comp admins can update" on public.%I for update to authenticated using (public.is_comp_admin()) with check (public.is_comp_admin())', t);
    execute format('revoke insert, update, delete, truncate, references, trigger on public.%I from public, anon', t);
  end loop;

  -- Deleting rows is part of the worksheet only, as before.
  foreach t in array array[
    'plate_cost_ingredients', 'plate_cost_shopping_trips', 'plate_cost_beverage_items'
  ] loop
    execute format('create policy "comp admins can delete" on public.%I for delete to authenticated using (public.is_comp_admin())', t);
  end loop;
end;
$$;

-- An admin who signs in stays signed in across the site, so the public Irie
-- Jerk lineup must be readable when signed in too.
drop policy if exists "Allow anon select" on public.irie_jerk_weekly_lineup;
create policy "anyone can read" on public.irie_jerk_weekly_lineup
  for select to anon, authenticated using (true);

commit;

-- Expected result: anon appears only on "anyone can read".
select tablename, cmd, roles::text, policyname
from pg_policies
where schemaname = 'public'
  and (tablename like 'plate_cost_%' or tablename in ('event_brainstorm_sessions', 'irie_jerk_weekly_lineup'))
order by 1, 2;
