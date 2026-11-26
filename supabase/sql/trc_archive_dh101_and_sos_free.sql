-- TRC Events only. Idempotent: safe to re-run.
begin;

-- Lists the ended Dancehall 101 series on /past-events.
insert into public.trc_past_events (slug, name, event_date, date_label, path, image_key, description) values
  ('dancehall-101', 'Dancehall 101', '2026-11-26', 'Friday series at Irie Jerk', '/dancehall-101', null,
   'Lessons in Dancehall Culture: Friday nights at Irie Jerk, with free entry for college students 21+.')
on conflict (slug) do nothing;

-- Sing Ova Sundays admission is free (previous cover_charge: 5).
update public.irie_jerk_weekly_lineup
  set cover_charge = 0, updated_at = now()
  where slug = 'sing-ova-sundays';

commit;

select
  (select count(*) from public.trc_past_events where slug = 'dancehall-101') as dh101_listed,
  (select cover_charge from public.irie_jerk_weekly_lineup where slug = 'sing-ova-sundays') as sing_ova_cover;
