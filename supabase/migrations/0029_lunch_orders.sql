-- Online lunch orders for Irie Jerk. New objects only; nothing existing changes.
--   * Customers can't read or write these tables. Orders arrive through the
--     lunch-order function, which calls place_lunch_order() as service_role.
--   * Lunch staff (lunch_staff plus the existing comp admins) read orders, move
--     them along and switch ordering on or off.
--   * Ordering starts switched OFF.
begin;

-- Kitchen and counter staff who need the lunch screen and nothing else.
create table public.lunch_staff (
  email text primary key check (email = lower(btrim(email))),
  name text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.lunch_staff enable row level security;
revoke all on public.lunch_staff from public, anon, authenticated;

create function public.is_lunch_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_comp_admin() or exists (
    select 1 from public.lunch_staff
    where email = lower(auth.jwt() ->> 'email') and active
  );
$$;
revoke execute on function public.is_lunch_staff() from public, anon;
grant execute on function public.is_lunch_staff() to authenticated;

create table public.lunch_settings (
  id boolean primary key default true check (id),
  accepting_orders boolean not null default false
);
insert into public.lunch_settings default values;
alter table public.lunch_settings enable row level security;
revoke all on public.lunch_settings from public, anon, authenticated;
grant select on public.lunch_settings to anon, authenticated;
grant update (accepting_orders) on public.lunch_settings to authenticated;
create policy "anyone can read" on public.lunch_settings
  for select to anon, authenticated using (true);
create policy "lunch staff can switch ordering" on public.lunch_settings
  for update to authenticated
  using (public.is_lunch_staff()) with check (public.is_lunch_staff());

create table public.lunch_orders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  order_date date not null,
  ticket_no integer not null,
  customer_name text not null check (char_length(customer_name) between 1 and 60),
  phone text not null check (phone ~ '^[0-9]{10}$'),
  service text not null check (service in ('pickup', 'dine_in')),
  table_label text check (char_length(table_label) <= 20),
  items jsonb not null,
  total integer not null check (total > 0),
  status text not null default 'kitchen'
    check (status in ('kitchen', 'ready', 'done', 'cancelled')),
  -- Build steps the line has ticked off, as "bowl:step" keys.
  checked jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_date, ticket_no)
);
create index lunch_orders_created_at on public.lunch_orders (created_at);
alter table public.lunch_orders enable row level security;
revoke all on public.lunch_orders from public, anon, authenticated;
grant select on public.lunch_orders to authenticated;
grant update (status, checked, updated_at) on public.lunch_orders to authenticated;
create policy "lunch staff can read" on public.lunch_orders
  for select to authenticated using (public.is_lunch_staff());
create policy "lunch staff can update" on public.lunch_orders
  for update to authenticated
  using (public.is_lunch_staff()) with check (public.is_lunch_staff());

-- Records an order if ordering is on and the limits allow it. Limits: 3 orders
-- per phone per hour and 120 orders per hour in total. Sending the same
-- request_id again returns the first ticket instead of a second order.
create function public.place_lunch_order(
  p_request_id uuid,
  p_name text,
  p_phone text,
  p_service text,
  p_table text,
  p_items jsonb,
  p_total integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Chicago')::date;
  v_order public.lunch_orders;
begin
  -- One order at a time, so limits and ticket numbers can't race.
  perform pg_advisory_xact_lock(hashtext('lunch_order'));

  select * into v_order from public.lunch_orders where request_id = p_request_id;
  if found then
    return jsonb_build_object('ok', true, 'ticket', v_order.ticket_no, 'total', v_order.total);
  end if;

  if not (select accepting_orders from public.lunch_settings) then
    return jsonb_build_object('ok', false, 'reason', 'closed');
  end if;
  if (select count(*) from public.lunch_orders
      where phone = p_phone and created_at > now() - interval '1 hour') >= 3 then
    return jsonb_build_object('ok', false, 'reason', 'phone_limit');
  end if;
  if (select count(*) from public.lunch_orders
      where created_at > now() - interval '1 hour') >= 120 then
    return jsonb_build_object('ok', false, 'reason', 'busy');
  end if;

  insert into public.lunch_orders
    (request_id, order_date, ticket_no, customer_name, phone, service, table_label, items, total)
  values (
    p_request_id,
    v_today,
    (select coalesce(max(ticket_no), 100) + 1 from public.lunch_orders where order_date = v_today),
    p_name, p_phone, p_service, p_table, p_items, p_total
  )
  returning * into v_order;

  return jsonb_build_object('ok', true, 'ticket', v_order.ticket_no, 'total', v_order.total);
end;
$$;
revoke execute on function public.place_lunch_order(uuid, text, text, text, text, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.place_lunch_order(uuid, text, text, text, text, jsonb, integer)
  to service_role;

commit;

-- Expected result: anon appears only on lunch_settings "anyone can read".
select tablename, cmd, roles::text, policyname
from pg_policies
where schemaname = 'public' and tablename like 'lunch_%'
order by 1, 2;
