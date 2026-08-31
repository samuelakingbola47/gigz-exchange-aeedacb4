-- ============================================================================
-- Custom email OTP verification system, fully independent of Supabase's
-- own built-in confirmation email (which only sends a link, not a code).
--
-- Adds:
--   - profiles.email_verified: tracks whether we've confirmed this user's
--     email via our own code, separate from Supabase's own status.
--   - email_verifications: stores generated codes with an expiry. Locked
--     down completely - no RLS policies at all, meaning NOTHING is
--     reachable by any client role. Only our SECURITY DEFINER functions
--     (which run as the table owner) can touch it.
--   - request_email_verification(): generates a 6-digit code, stores it,
--     and emails it via Resend (using the http extension + Vault secret,
--     same pattern as the 5sim integration).
--   - verify_email_code(_code): checks the code, marks it used, and marks
--     the user verified - both in our own profiles table AND in
--     Supabase's own auth.users.email_confirmed_at, so everything stays
--     consistent with Supabase's native understanding of the user too.
-- ============================================================================

alter table public.profiles
  add column if not exists email_verified boolean not null default false;

create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS enabled with ZERO policies = completely unreachable by any client
-- role (anon or authenticated). Only SECURITY DEFINER functions below,
-- which run as the table owner, can read or write this table.
alter table public.email_verifications enable row level security;


create or replace function public.request_email_verification()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _uid uuid := auth.uid();
  _email text;
  _code text;
  _api_key text;
  _res http_response;
begin
  if _uid is null then
    raise exception 'Not authenticated';
  end if;

  select email into _email from auth.users where id = _uid;
  if _email is null then
    raise exception 'No email found for this account';
  end if;

  -- 6-digit numeric code, zero-padded
  _code := lpad(floor(random() * 1000000)::text, 6, '0');

  insert into public.email_verifications (user_id, code, expires_at)
  values (_uid, _code, now() + interval '10 minutes');

  select decrypted_secret into _api_key from vault.decrypted_secrets where name = 'resend_api_key';
  if _api_key is null then
    raise exception 'Email service is not configured';
  end if;

  select * into _res from http((
    'POST',
    'https://api.resend.com/emails',
    ARRAY[http_header('Authorization', 'Bearer ' || _api_key)],
    'application/json',
    json_build_object(
      'from', 'Gigz Exchange <onboarding@resend.dev>',
      'to', array[_email],
      'subject', 'Your Gigz Exchange verification code',
      'html', format(
        '<p>Your verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px;">%s</p><p>This code expires in 10 minutes.</p>',
        _code
      )
    )::text
  )::http_request);

  if _res.status < 200 or _res.status >= 300 then
    raise exception 'Failed to send verification email (status %): %', _res.status, _res.content;
  end if;
end;
$function$;

revoke all on function public.request_email_verification() from public, anon;
grant execute on function public.request_email_verification() to authenticated;


create or replace function public.verify_email_code(_code text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _uid uuid := auth.uid();
  _match public.email_verifications;
begin
  if _uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into _match
  from public.email_verifications
  where user_id = _uid
    and code = _code
    and consumed_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if not found then
    raise exception 'Invalid or expired verification code';
  end if;

  update public.email_verifications set consumed_at = now() where id = _match.id;
  update public.profiles set email_verified = true, updated_at = now() where id = _uid;
  -- Keep Supabase's own native field consistent too, so nothing else in
  -- the auth system disagrees about this user's verified status.
  update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = _uid;
end;
$function$;

revoke all on function public.verify_email_code(text) from public, anon;
grant execute on function public.verify_email_code(text) to authenticated;
