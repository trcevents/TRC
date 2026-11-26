-- 6-digit email sign-in codes for TRC comp admins (admin-login-code function).
-- Only that function (service_role) can touch the table or the check below.
begin;

create table public.admin_login_codes (
  email text primary key,
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.admin_login_codes enable row level security;
revoke all on public.admin_login_codes from public, anon, authenticated;

-- Counts the guess and compares it in one step, so parallel requests can't get
-- more than 5 tries per code. A correct code can be used once.
create function public.admin_login_try(p_email text, p_code_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
begin
  update public.admin_login_codes
    set attempts = attempts + 1
    where email = p_email and attempts < 5 and expires_at > now()
    returning code_hash into v_hash;

  if v_hash is null or v_hash <> p_code_hash then
    return false;
  end if;

  delete from public.admin_login_codes where email = p_email and code_hash = p_code_hash;
  return found;
end;
$$;

revoke execute on function public.admin_login_try(text, text) from public, anon, authenticated;
grant execute on function public.admin_login_try(text, text) to service_role;

commit;
