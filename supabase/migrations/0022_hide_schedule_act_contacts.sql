-- Performer phone and email on schedule_acts were readable by anyone. Visitors
-- keep read access to the lineup columns only; update-schedule-act returns the
-- contact columns after checking the team password.
-- A column added later is not readable by visitors until it is granted here.
begin;

revoke select on public.schedule_acts from public, anon, authenticated;

grant select (id, position, time_slot, act_name, online_promo,
  social_media_received, contract_signed, tickets_ordered, updated_at)
  on public.schedule_acts to anon, authenticated;

commit;

-- Expected result: no phone or email in either list.
select grantee, string_agg(column_name, ',' order by column_name) as readable_columns
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'schedule_acts'
  and privilege_type = 'SELECT' and grantee in ('anon', 'authenticated', 'PUBLIC')
group by grantee;
