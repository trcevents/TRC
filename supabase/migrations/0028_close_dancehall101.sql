-- Dancehall 101 is archived: close signups, door check-in and the attendee list.
-- No data is deleted. To reopen, restore the grants below and the policy
--   create policy "anon insert signups" on public.dh101_signups
--     for insert to anon with check (true);
-- and give door check-in a real staff check first.
begin;

drop policy if exists "anon insert signups" on public.dh101_signups;
revoke all on public.dh101_signups from public, anon, authenticated;
revoke all on public.dh101_door_checkin from public, anon, authenticated;
revoke execute on function public.dh101_check_in_ticket(text) from public, anon, authenticated;

commit;

-- Expected result: everything false, and 0 policies.
select
  has_table_privilege('anon', 'public.dh101_signups', 'insert') as anon_can_sign_up,
  has_table_privilege('authenticated', 'public.dh101_door_checkin', 'select') as users_can_see_list,
  has_function_privilege('authenticated', 'public.dh101_check_in_ticket(text)', 'execute') as users_can_check_in,
  has_function_privilege('anon', 'public.dh101_check_in_ticket(text)', 'execute') as anon_can_check_in,
  (select count(*) from pg_policies where schemaname = 'public' and tablename = 'dh101_signups') as signup_policies;
