-- ============================================================================
-- purchase_real_number
-- Purpose: The money-safe core of a REAL number purchase. Locks the wallet,
-- checks balance, charges it, and creates the order - all atomically.
--
-- This does NOT call 5sim itself. It's designed to be called by the
-- buy-number Edge Function AFTER that function has already:
--   1. Asked 5sim for a real price
--   2. Actually bought the number from 5sim
--   3. Received back a real phone number + 5sim's own order id + the
--      final price 5sim actually charged
--
-- Splitting it this way means this SQL function can be tested completely
-- on its own first, with made-up test values, before any real 5sim call
-- exists - same approach used for credit_wallet.
--
-- SECURITY DEFINER, granted to service_role ONLY (never authenticated or
-- anon) - because by the time this runs, real money has already been
-- spent on 5sim's side, so this must only ever be called by trusted
-- server-side code (the Edge Function), never directly by a user's browser.
--
-- IDEMPOTENCY: guards against being called twice for the same 5sim order
-- (e.g. if the Edge Function retries after a network hiccup) by checking
-- provider_reference before charging again.
-- ============================================================================

create or replace function public.purchase_real_number(
  _user_id uuid,
  _country_name text,
  _country_code text,
  _service_name text,
  _service_code text,
  _phone_number text,
  _price_ngn numeric,
  _provider_reference text,
  _expires_at timestamptz
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $function$
declare
  _bal numeric;
  _existing public.orders;
  _order public.orders;
begin
  if _price_ngn is null or _price_ngn <= 0 then
    raise exception 'Price must be greater than zero';
  end if;

  if _provider_reference is null or length(trim(_provider_reference)) = 0 then
    raise exception 'A provider_reference is required for idempotency';
  end if;

  -- Idempotency guard: if we've already created an order for this exact
  -- 5sim order id, return it instead of charging the wallet a second time.
  select * into _existing
  from public.orders
  where provider_reference = _provider_reference
  limit 1;

  if found then
    return _existing;
  end if;

  -- Lock the wallet row so nothing else can read/write it mid-transaction.
  select balance into _bal
  from public.wallets
  where user_id = _user_id
  for update;

  if not found then
    raise exception 'Wallet not found for user %', _user_id;
  end if;

  if _bal < _price_ngn then
    raise exception 'Insufficient wallet balance';
  end if;

  update public.wallets
  set balance = _bal - _price_ngn,
      updated_at = now()
  where user_id = _user_id;

  insert into public.orders (
    user_id, country, country_code, service, service_code,
    phone_number, price, currency, status, is_demo,
    provider_reference, expires_at
  )
  values (
    _user_id, _country_name, _country_code, _service_name, _service_code,
    _phone_number, _price_ngn, 'NGN', 'waiting', false,
    _provider_reference, _expires_at
  )
  returning * into _order;

  insert into public.wallet_transactions (
    user_id, type, amount, balance_before, balance_after,
    currency, description, status
  )
  values (
    _user_id, 'purchase', -_price_ngn, _bal, _bal - _price_ngn, 'NGN',
    concat(_service_name, ' · ', _country_name, ' (', _order.order_reference, ')'),
    'completed'
  );

  return _order;
end;
$function$;

revoke all on function public.purchase_real_number(
  uuid, text, text, text, text, text, numeric, text, timestamptz
) from public, anon, authenticated;

grant execute on function public.purchase_real_number(
  uuid, text, text, text, text, text, numeric, text, timestamptz
) to service_role;
