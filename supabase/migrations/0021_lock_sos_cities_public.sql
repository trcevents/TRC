-- Applied 2026-11-26. Make sos_cities_public read-only for site visitors and signed-in users.
-- The view is updatable and runs with its owner's rights, so write grants on it
-- bypass the access rules on sos_cities. Reading stays as it is.
-- Same pattern as 0009_fix_dh101_grant_drift.sql. Do not set security_invoker:
-- the view is meant to show city names for unpublished cities too.
begin;

revoke insert, update, delete, truncate, references, trigger
  on public.sos_cities_public
  from public, anon, authenticated;

commit;

-- Expected result: only SELECT rows for anon and authenticated.
select grantee, string_agg(privilege_type, ',' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'sos_cities_public'
  and grantee in ('anon', 'authenticated', 'PUBLIC')
group by grantee;
