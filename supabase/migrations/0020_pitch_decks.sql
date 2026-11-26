-- Reusable venue-pitch deck system for trcevent.com, per Stephen (2026-07-17):
-- converts one-off PowerPoint pitches (e.g. Dancehall101_UptownLounge_Pitch.pptx)
-- into a live webpage the reader flips through slide by slide, and generalizes
-- the structure so it works for all future pitches -- Stephen expects up to
-- ~300 of these over time, to different venues/events, not just this one.
--
-- One row per pitch (cover/contact metadata) + one row per slide (all the
-- actual content, fully data-driven so a single generic React viewer
-- component handles every pitch -- no per-pitch frontend code changes).
--
-- Same "no anon/authenticated read policy" pattern as contract_invites:
-- pitch content is confidential business material shared with one external
-- venue contact via an unlisted link, not something that should be
-- queryable in bulk through the public REST API using the anon key that
-- ships in the JS bundle. Reads go through the public get-pitch Edge
-- Function (by slug only, one pitch at a time); writes go through the
-- admin-gated create-pitch Edge Function.
create table if not exists pitches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  venue_name text not null,
  venue_address text not null default '',
  contact_name text not null default '',
  contact_title text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  prepared_by_name text not null default '',
  prepared_by_org text not null default '',
  pitch_date date,
  logo_url text,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table pitches enable row level security;
-- No public policies at all -- only the Edge Functions (service_role) read/write.

-- Every slide in a deck, in order. `layout` picks which generic renderer the
-- frontend uses; `body` is intentionally loose jsonb (shape depends on
-- layout) so new pitches never need a schema change to express a new slide's
-- content -- see get-pitch/create-pitch and the frontend's slide renderer
-- for the layouts currently understood:
--   cover, statement, points, list, crowd, timeline, criteria, cost, roles,
--   growth, gratitude, next-steps
create table if not exists pitch_slides (
  id uuid primary key default gen_random_uuid(),
  pitch_id uuid not null references pitches(id) on delete cascade,
  position integer not null,
  layout text not null,
  kicker text not null default '',
  heading text not null default '',
  subheading text not null default '',
  body jsonb not null default '[]'::jsonb,
  image_url text,
  created_at timestamptz not null default now(),
  unique (pitch_id, position)
);

alter table pitch_slides enable row level security;
-- No public policies here either -- see pitches above.

-- Public bucket for pitch logos/photos -- these are just images (not
-- sensitive on their own), served by direct public URL so the frontend
-- never needs a signed-URL round trip. Confidentiality lives in the deck
-- text/terms (pitches/pitch_slides tables above), not the images.
insert into storage.buckets (id, name, public)
values ('pitch-assets', 'pitch-assets', true)
on conflict (id) do nothing;
