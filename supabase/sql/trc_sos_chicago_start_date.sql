-- TRC Events only. Sing Ova Sundays Chicago starts Sunday, December 13, 2026.
-- Previous value: 2026-08-30.
update public.sos_cities
  set launch_date = date '2026-12-13'
  where slug = 'chicago';

select slug, launch_date, to_char(launch_date, 'FMDay') as weekday
from public.sos_cities where slug = 'chicago';
