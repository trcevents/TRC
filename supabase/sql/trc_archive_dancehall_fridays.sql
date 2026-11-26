-- TRC Events only. Lists the ended Dancehall Fridays series on /past-events.
-- Idempotent: safe to re-run.
insert into public.trc_past_events (slug, name, event_date, date_label, path, image_key, description) values
  ('dancehall-fridays', 'Dancehall Fridays — Girls Night Out', '2026-09-25',
   'Fridays from September 25, 2026', '/dancehall-fridays', 'dancehall-fridays',
   'Girls Night Out with DJ Bad Chargie, presented by Dougiefresh & One Draw Crew at Banquet Hall – A Place for You.')
on conflict (slug) do nothing;

select slug, event_date from public.trc_past_events order by event_date desc;
