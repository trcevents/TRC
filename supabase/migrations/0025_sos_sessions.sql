-- Sing Ova: tie each action to the person who entered the code, and let the
-- pages work without reading anyone's email. verify-sos-code issues a random
-- token (only its hash is stored); these functions check it. Additive: nothing
-- existing is locked here (see 0026).
begin;

create table public.sos_sessions (
  token_hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.sos_sessions enable row level security;
revoke all on public.sos_sessions from public, anon, authenticated;

-- Internal: only the functions below call it.
create function public.sos_session_email(p_token text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select email from public.sos_sessions
  where token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
    and expires_at > now();
$$;

revoke execute on function public.sos_session_email(text) from public, anon, authenticated;

-- Approved and played pairings, newest first, with heart counts and whether the
-- caller hearted each one. No email addresses.
create function public.sos_feed(
  p_token text default null,
  p_city_id uuid default null,
  p_limit integer default 100
)
returns table (
  id uuid, city_id uuid, display_name text,
  original_artist text, original_title text, reggae_artist text, reggae_title text,
  direction text, note text, week_theme text, status text, created_at timestamptz,
  city_name text, city_slug text, heart_count bigint, mine boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.city_id, p.display_name,
    p.original_artist, p.original_title, p.reggae_artist, p.reggae_title,
    p.direction, p.note, p.week_theme, p.status, p.created_at,
    c.name, c.slug,
    (select count(*) from public.sos_pairing_hearts h where h.pairing_id = p.id),
    exists (
      select 1 from public.sos_pairing_hearts h
      where h.pairing_id = p.id
        and lower(h.email) = lower(public.sos_session_email(p_token))
    )
  from public.sos_pairings p
  left join public.sos_cities c on c.id = p.city_id and c.status = 'published'
  where p.status in ('approved', 'played')
    and (p_city_id is null or p.city_id = p_city_id)
  order by p.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 200);
$$;

-- Returns true if the pairing is now hearted, false if the heart was removed.
create function public.sos_toggle_heart(p_token text, p_pairing_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := public.sos_session_email(p_token);
begin
  if v_email is null then
    raise exception 'sos_session_expired';
  end if;
  if not exists (
    select 1 from public.sos_pairings p
    where p.id = p_pairing_id and p.status in ('approved', 'played')
  ) then
    raise exception 'sos_pairing_unavailable';
  end if;

  delete from public.sos_pairing_hearts h
  where h.pairing_id = p_pairing_id and lower(h.email) = lower(v_email);
  if found then
    return false;
  end if;

  insert into public.sos_pairing_hearts (pairing_id, email)
  values (p_pairing_id, v_email)
  on conflict do nothing;
  return true;
end;
$$;

-- Always creates a pending pairing under the caller's own email.
create function public.sos_submit_pairing(
  p_token text, p_city_id uuid, p_display_name text,
  p_original_artist text, p_original_title text,
  p_reggae_artist text, p_reggae_title text,
  p_direction text, p_note text default null, p_week_theme text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := public.sos_session_email(p_token);
begin
  if v_email is null then
    raise exception 'sos_session_expired';
  end if;
  if not public.sos_city_is_published(p_city_id) then
    raise exception 'sos_city_unavailable';
  end if;
  if exists (
    select 1 from unnest(array[p_display_name, p_original_artist, p_original_title,
      p_reggae_artist, p_reggae_title]) as v(x)
    where x is null or btrim(x) = '' or length(x) > 200
  ) or length(coalesce(p_note, '')) > 1000 or length(coalesce(p_week_theme, '')) > 100 then
    raise exception 'sos_invalid_pairing';
  end if;

  insert into public.sos_pairings (city_id, email, display_name, original_artist,
    original_title, reggae_artist, reggae_title, direction, note, week_theme, status)
  values (p_city_id, v_email, btrim(p_display_name), btrim(p_original_artist),
    btrim(p_original_title), btrim(p_reggae_artist), btrim(p_reggae_title),
    p_direction, nullif(btrim(p_note), ''), p_week_theme, 'pending');
end;
$$;

revoke execute on function public.sos_feed(text, uuid, integer) from public;
revoke execute on function public.sos_toggle_heart(text, uuid) from public;
revoke execute on function public.sos_submit_pairing(text, uuid, text, text, text, text, text, text, text, text) from public;
grant execute on function public.sos_feed(text, uuid, integer) to anon, authenticated;
grant execute on function public.sos_toggle_heart(text, uuid) to anon, authenticated;
grant execute on function public.sos_submit_pairing(text, uuid, text, text, text, text, text, text, text, text) to anon, authenticated;

commit;

-- Check: the feed runs and returns no email column.
select count(*) as feed_rows, coalesce(sum(heart_count), 0) as hearts from public.sos_feed();
