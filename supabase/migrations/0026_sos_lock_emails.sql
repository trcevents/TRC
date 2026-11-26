-- Sing Ova: stop public reads of emails and public writes. Apply after the site
-- uses sos_feed / sos_toggle_heart / sos_submit_pairing (0025). City admins keep
-- reading and updating pairings through their existing signed-in policies.
begin;

do $$
declare
  p record;
begin
  for p in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('sos_pairings', 'sos_pairing_hearts')
      and 'anon' = any (roles)
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end;
$$;

revoke all on public.sos_pairing_hearts from public, anon, authenticated;
revoke all on public.sos_pairings from public, anon;
revoke insert, delete, truncate, references, trigger on public.sos_pairings from authenticated;

commit;

-- Expected result: only authenticated on sos_pairings, with SELECT,UPDATE.
select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('sos_pairings', 'sos_pairing_hearts')
  and grantee in ('anon', 'authenticated', 'PUBLIC')
group by 1, 2;
