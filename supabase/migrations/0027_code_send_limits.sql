-- Limits on the TRC functions that email codes to the public. Per address (or
-- per act): one a minute and 5 an hour. Per form: 60 an hour in total, so one
-- caller can't use up the shared email quota with many addresses.
-- Only the edge functions (service_role) can call or read any of this.
begin;

create table public.code_send_log (
  kind text not null,
  target text not null,
  sent_at timestamptz not null default now()
);

create index code_send_log_kind_sent_at on public.code_send_log (kind, sent_at);

alter table public.code_send_log enable row level security;
revoke all on public.code_send_log from public, anon, authenticated;

-- Returns true and records the send if it is within the limits.
create function public.code_send_allowed(p_kind text, p_target text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target text := lower(btrim(p_target));
begin
  -- One check at a time per form, so parallel requests can't slip past.
  perform pg_advisory_xact_lock(hashtext('code_send:' || p_kind));

  delete from public.code_send_log
    where kind = p_kind and sent_at < now() - interval '1 hour';

  if exists (
    select 1 from public.code_send_log
    where kind = p_kind and target = v_target and sent_at > now() - interval '60 seconds'
  ) or (
    select count(*) from public.code_send_log where kind = p_kind and target = v_target
  ) >= 5 or (
    select count(*) from public.code_send_log where kind = p_kind
  ) >= 60 then
    return false;
  end if;

  insert into public.code_send_log (kind, target) values (p_kind, v_target);
  return true;
end;
$$;

revoke execute on function public.code_send_allowed(text, text) from public, anon, authenticated;
grant execute on function public.code_send_allowed(text, text) to service_role;

commit;
