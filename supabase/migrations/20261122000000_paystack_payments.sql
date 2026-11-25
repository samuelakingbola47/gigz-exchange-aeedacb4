-- ============================================================================
-- PAYSTACK WALLET FUNDING
--
-- Flow (all inside the database, same approach as the 5sim integration):
--   1. start_paystack_payment(amount)  -> creates a pending payment, asks
--      Paystack for a checkout page, returns its address.
--   2. Customer pays on Paystack's own page and is sent back to /dashboard/wallet.
--   3. verify_paystack_payment(reference) -> asks Paystack "was this paid, and
--      for how much?" and ONLY THEN credits the wallet (via credit_wallet).
--   4. reconcile_pending_payments() runs every few minutes in the background
--      and settles payments whose customer closed the tab before returning.
--
-- Safety rules built in:
--   - The amount is fixed on OUR side before the customer pays, and re-checked
--     against Paystack's own record. A mismatch is never credited.
--   - Crediting is idempotent: a payment can only ever credit once, however
--     many times it is verified (row lock + credit_wallet's reference check).
--   - The Paystack secret key lives in Vault (name: paystack_secret_key).
--   - Customers can only verify their own payments; the settle/reconcile
--     functions are not callable from the browser at all.
-- ============================================================================

-- --- settings (editable with plain SQL, no code changes) -----------------------
insert into public.app_settings (key, value, description) values
  ('site_url', 'https://gigz-exchange-aeedacb4.akingbolasamuel2002.workers.dev',
   'Public address of the website, used as the return address after payment. Change to your own domain when it is ready.'),
  ('min_deposit_ngn', '500', 'Smallest wallet top-up allowed, in Naira.'),
  ('max_deposit_ngn', '1000000', 'Largest single wallet top-up allowed, in Naira.')
on conflict (key) do nothing;

-- --- payments table -------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique,
  amount_ngn numeric(14,2) not null check (amount_ngn > 0),
  status text not null default 'pending',
  provider text not null default 'paystack',
  gateway_response text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint payments_status_check
    check (status = any (array['pending'::text, 'completed'::text, 'failed'::text, 'expired'::text]))
);

create index if not exists idx_payments_user on public.payments using btree (user_id, created_at desc);
create index if not exists idx_payments_pending on public.payments using btree (status, created_at) where status = 'pending';

drop trigger if exists trg_payments_updated on public.payments;
create trigger trg_payments_updated before update on public.payments
  for each row execute function public.update_updated_at_column();

alter table public.payments enable row level security;
drop policy if exists "Users view own payments" on public.payments;
create policy "Users view own payments" on public.payments
  for select to authenticated
  using ((auth.uid() = user_id) or has_role(auth.uid(), 'admin'::app_role));

-- customers may READ their payments; nothing can be written from the browser
revoke all on public.payments from anon, authenticated;
grant select on public.payments to authenticated;
grant all on public.payments to service_role;

-- --- 1. start a payment ------------------------------------------------------------
create or replace function public.start_paystack_payment(_amount_ngn numeric)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _uid uuid := auth.uid();
  _email text;
  _min numeric;
  _max numeric;
  _site text;
  _key text;
  _ref text;
  _res http_response;
  _json jsonb;
begin
  if _uid is null then
    raise exception 'Not authenticated';
  end if;

  select value::numeric into _min from public.app_settings where key = 'min_deposit_ngn';
  select value::numeric into _max from public.app_settings where key = 'max_deposit_ngn';
  _min := coalesce(_min, 500);
  _max := coalesce(_max, 1000000);

  if _amount_ngn is null or round(_amount_ngn, 2) < _min or round(_amount_ngn, 2) > _max then
    raise exception 'Enter an amount between % and % naira', _min, _max;
  end if;
  _amount_ngn := round(_amount_ngn, 2);

  -- simple abuse guard: no more than 10 unfinished payments per hour
  if (select count(*) from public.payments
      where user_id = _uid and status = 'pending' and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many unfinished payments. Please wait a little and try again.';
  end if;

  select email into _email from auth.users where id = _uid;
  select decrypted_secret into _key from vault.decrypted_secrets where name = 'paystack_secret_key';
  if _key is null then
    raise exception 'Payments are not configured yet';
  end if;
  select value into _site from public.app_settings where key = 'site_url';
  if _site is null or length(trim(_site)) = 0 then
    raise exception 'Site address is not configured';
  end if;

  _ref := 'GXP-' || upper(substr(md5(random()::text || clock_timestamp()::text || _uid::text), 1, 14));

  insert into public.payments (user_id, reference, amount_ngn)
  values (_uid, _ref, _amount_ngn);

  select * into _res from http((
    'POST',
    'https://api.paystack.co/transaction/initialize',
    ARRAY[http_header('Authorization', 'Bearer ' || _key)],
    'application/json',
    json_build_object(
      'email', _email,
      'amount', round(_amount_ngn * 100)::bigint,   -- Paystack counts in kobo
      'currency', 'NGN',
      'reference', _ref,
      'callback_url', rtrim(_site, '/') || '/dashboard/wallet',
      'metadata', json_build_object('user_id', _uid, 'purpose', 'wallet_funding')
    )::text
  )::http_request);

  begin
    _json := _res.content::jsonb;
  exception when others then
    _json := null;
  end;

  if _res.status <> 200 or _json is null or coalesce((_json->>'status')::boolean, false) is not true then
    raise exception 'Could not start the payment (status %): %',
      _res.status, left(coalesce(_json->>'message', _res.content, 'no response'), 200);
  end if;

  return jsonb_build_object(
    'authorization_url', _json->'data'->>'authorization_url',
    'reference', _ref
  );
end;
$function$;

-- --- 2. settle one payment (internal: asks Paystack, credits wallet once) --------------
create or replace function public.settle_paystack_payment(_reference text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _p public.payments;
  _key text;
  _res http_response;
  _json jsonb;
  _data jsonb;
begin
  -- lock this payment so two simultaneous checks cannot both credit it
  select * into _p from public.payments where reference = _reference for update;
  if not found then
    raise exception 'Payment not found';
  end if;
  if _p.status = 'completed' then return 'completed'; end if;
  if _p.status = 'failed' then return 'failed'; end if;

  select decrypted_secret into _key from vault.decrypted_secrets where name = 'paystack_secret_key';
  if _key is null then
    raise exception 'Payments are not configured yet';
  end if;

  select * into _res from http((
    'GET',
    'https://api.paystack.co/transaction/verify/' || _p.reference,
    ARRAY[http_header('Authorization', 'Bearer ' || _key)],
    NULL,
    NULL
  )::http_request);

  update public.payments set last_checked_at = now() where id = _p.id;

  begin
    _json := _res.content::jsonb;
  exception when others then
    _json := null;
  end;

  -- Paystack does not know this reference yet, or is unreachable: leave it pending
  if _res.status <> 200 or _json is null or coalesce((_json->>'status')::boolean, false) is not true then
    return _p.status;
  end if;

  _data := _json->'data';

  if _data->>'status' = 'success' then
    -- the amount and currency must match what WE recorded before the customer paid
    if _data->>'currency' is distinct from 'NGN'
       or (_data->>'amount')::bigint is distinct from round(_p.amount_ngn * 100)::bigint then
      update public.payments
         set status = 'failed',
             gateway_response = 'AMOUNT MISMATCH - review manually (paid ' || coalesce(_data->>'amount', '?') || ' kobo)'
       where id = _p.id;
      return 'failed';
    end if;

    perform public.credit_wallet(_p.user_id, _p.amount_ngn, _p.reference, 'Wallet funding via Paystack');

    update public.payments
       set status = 'completed',
           completed_at = now(),
           gateway_response = coalesce(_data->>'gateway_response', 'Successful')
     where id = _p.id;
    return 'completed';

  elsif _data->>'status' = any (array['failed', 'reversed']) then
    update public.payments
       set status = 'failed',
           gateway_response = coalesce(_data->>'gateway_response', _data->>'status')
     where id = _p.id;
    return 'failed';
  end if;

  -- 'abandoned', 'ongoing', 'pending' ...: customer has not finished yet
  return _p.status;
end;
$function$;

-- --- 3. customer checks one of THEIR payments (after returning from Paystack) ----------
create or replace function public.verify_paystack_payment(_reference text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _uid uuid := auth.uid();
  _p public.payments;
begin
  if _uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into _p from public.payments where reference = _reference and user_id = _uid;
  if not found then
    raise exception 'Payment not found';
  end if;

  -- avoid hammering Paystack if the page is refreshed repeatedly
  if _p.status = 'pending' and _p.last_checked_at is not null
     and _p.last_checked_at > now() - interval '4 seconds' then
    return 'pending';
  end if;

  return public.settle_paystack_payment(_reference);
end;
$function$;

-- --- 4. when the wallet page opens, settle any of THEIR unfinished payments -------------
create or replace function public.verify_my_pending_payments()
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _uid uuid := auth.uid();
  _r record;
  _done integer := 0;
begin
  if _uid is null then
    raise exception 'Not authenticated';
  end if;

  for _r in
    select reference from public.payments
    where user_id = _uid
      and status = 'pending'
      and created_at > now() - interval '24 hours'
      and (last_checked_at is null or last_checked_at < now() - interval '20 seconds')
    order by created_at desc
    limit 3
  loop
    begin
      if public.settle_paystack_payment(_r.reference) = 'completed' then
        _done := _done + 1;
      end if;
    exception when others then
      null; -- one failing check must not block the others
    end;
  end loop;

  return _done;
end;
$function$;

-- --- 5. background sweeper (runs every few minutes via pg_cron) ------------------------
create or replace function public.reconcile_pending_payments()
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _r record;
  _done integer := 0;
begin
  for _r in
    select reference from public.payments
    where status = 'pending'
      and created_at > now() - interval '24 hours'
      and created_at < now() - interval '1 minute'
      and (last_checked_at is null or last_checked_at < now() - interval '3 minutes')
    order by created_at
    limit 25
  loop
    begin
      if public.settle_paystack_payment(_r.reference) = 'completed' then
        _done := _done + 1;
      end if;
    exception when others then
      null;
    end;
  end loop;

  -- payments never completed within a day are closed (a late payment can still be
  -- settled if the customer returns with its reference)
  update public.payments
     set status = 'expired'
   where status = 'pending' and created_at < now() - interval '24 hours';

  return _done;
end;
$function$;

-- --- who may call what -------------------------------------------------------------------
revoke all on function
  public.start_paystack_payment(numeric),
  public.settle_paystack_payment(text),
  public.verify_paystack_payment(text),
  public.verify_my_pending_payments(),
  public.reconcile_pending_payments()
from public, anon, authenticated;

grant execute on function
  public.start_paystack_payment(numeric),
  public.verify_paystack_payment(text),
  public.verify_my_pending_payments()
to authenticated;

grant execute on function
  public.start_paystack_payment(numeric),
  public.settle_paystack_payment(text),
  public.verify_paystack_payment(text),
  public.verify_my_pending_payments(),
  public.reconcile_pending_payments()
to service_role;
