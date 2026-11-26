-- TRC Events only. Sing Ova Sundays Chicago moved to Irie Jerk Bar and Grill in
-- Calumet Park (same venue as src/lib/thursday/irie-jerk-juggling-event.ts).
-- Previous values: 'Jerky Jerk', '7300 N Western Ave, Chicago, IL 60645'.
update public.sos_cities
  set venue_name = 'Irie Jerk Bar and Grill',
      venue_address = '1413 W 127th St, Calumet Park, IL 60827'
  where slug = 'chicago';

select slug, venue_name, venue_address from public.sos_cities where slug = 'chicago';
