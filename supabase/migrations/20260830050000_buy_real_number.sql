-- ============================================================================
-- buy_real_number
-- Purpose: The complete real-number purchase flow, as one SQL function,
-- callable directly from the frontend via supabase.rpc('buy_real_number', ...).
--
-- This replaces what would have been a separate Edge Function - instead,
-- it uses the `http` extension to call 5sim directly from inside Postgres,
-- and the 5sim API key comes from Supabase Vault (not Lovable Secrets,
-- which only Edge Functions can read).
--
-- Flow:
--   1. Identify the caller via auth.uid() (same pattern as
--      purchase_demo_number - only a logged-in user can call this).
--   2. Look up the country/service and their 5sim slugs.
--   3. Read pricing settings (exchange rate + markup).
--   4. Get a live price quote from 5sim (no money spent yet).
--   5. Check wallet balance covers the quoted price - stop here if not,
--      BEFORE any real 5sim money is spent.
--   6. Actually buy the number from 5sim.
--   7. Recompute the final price from what 5sim actually charged.
--   8. Call purchase_real_number to atomically charge the wallet and
--      create the order (reusing the already-tested function).
--   9. Safety net: if step 8 fails for any reason after step 6 already
--      succeeded, cancel the 5sim order so it isn't wasted.
--
-- SECURITY DEFINER + granted to `authenticated` only (mirrors
-- purchase_demo_number) - runs with elevated privilege so it can read
-- the Vault secret and call purchase_real_number, but still requires a
-- real logged-in caller via auth.uid().
-- ============================================================================

create or replace function public.buy_real_number(
  _country_code text,
  _service_code text
)
returns public.orders
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _uid uuid := auth.uid();
  _country record;
  _service record;
  _usd_to_ngn numeric;
  _markup numeric;
  _api_key text;
  _quote_res http_response;
  _quote_json jsonb;
  _cheapest_usd numeric;
  _quoted_ngn numeric;
  _wallet_balance numeric;
  _buy_res http_response;
  _buy_json jsonb;
  _final_usd numeric;
  _final_ngn numeric;
  _provider_ref text;
  _phone text;
  _expires timestamptz;
  _order public.orders;
begin
  if _uid is null then
    raise exception 'Not authenticated';
  end if;

  -- --- look up country / service -------------------------------------
  select * into _country from public.countries
  where country_code = _country_code and status = 'active';
  if not found then
    raise exception 'Country not available';
  end if;

  select * into _service from public.services
  where code = _service_code and status = 'active';
  if not found then
    raise exception 'Service not available';
  end if;

  if _country.provider_country_slug is null or _service.provider_service_code is null then
    raise exception 'This country/service is not yet configured for real purchases';
  end if;

  -- --- pricing settings ------------------------------------------------
  select value::numeric into _usd_to_ngn from public.app_settings where key = 'usd_to_ngn_rate';
  select value::numeric into _markup from public.app_settings where key = 'default_markup_percent';
  if _usd_to_ngn is null or _usd_to_ngn <= 0 then
    raise exception 'Pricing is not configured correctly';
  end if;

  -- --- get the 5sim API key from Vault ---------------------------------
  select decrypted_secret into _api_key
  from vault.decrypted_secrets
  where name = 'fivesim_api_key';
  if _api_key is null then
    raise exception 'SMS provider is not configured';
  end if;

  -- --- Step 1: live quote (no money spent yet) --------------------------
  select * into _quote_res from http_get(
    format('https://5sim.net/v1/guest/prices?country=%s&product=%s',
      _country.provider_country_slug, _service.provider_service_code)
  );
  _quote_json := _quote_res.content::jsonb;

  select min((op.value->>'cost')::numeric) into _cheapest_usd
  from jsonb_each(_quote_json #> array[_country.provider_country_slug, _service.provider_service_code]) as op
  where (op.value->>'count')::int > 0;

  if _cheapest_usd is null then
    raise exception 'No numbers currently in stock for this country/service';
  end if;

  _quoted_ngn := ceil(_cheapest_usd * _usd_to_ngn * (1 + _markup));

  -- --- Step 2: check wallet BEFORE spending real money on 5sim -----------
  select balance into _wallet_balance from public.wallets where user_id = _uid;
  if not found then
    raise exception 'Wallet not found';
  end if;
  if _wallet_balance < _quoted_ngn then
    raise exception 'Insufficient wallet balance';
  end if;

  -- --- Step 3: actually buy the number from 5sim --------------------------
  select * into _buy_res from http((
    'GET',
    format('https://5sim.net/v1/user/buy/activation/%s/any/%s',
      _country.provider_country_slug, _service.provider_service_code),
    ARRAY[http_header('Authorization', 'Bearer ' || _api_key)],
    NULL,
    NULL
  )::http_request);

  _buy_json := _buy_res.content::jsonb;

  if _buy_res.status != 200 or _buy_json->>'id' is null or _buy_json->>'phone' is null then
    raise exception 'Provider error: %', coalesce(_buy_json->>'message', _buy_res.content);
  end if;

  _provider_ref := _buy_json->>'id';
  _phone := _buy_json->>'phone';
  _final_usd := (_buy_json->>'price')::numeric;
  _expires := (_buy_json->>'expires')::timestamptz;
  _final_ngn := ceil(_final_usd * _usd_to_ngn * (1 + _markup));

  -- --- Step 4: charge wallet + create order, atomically -------------------
  begin
    select * into _order from public.purchase_real_number(
      _uid, _country.name, _country.country_code,
      _service.name, _service.code,
      _phone, _final_ngn, _provider_ref, _expires
    );
  exception when others then
    -- Safety net: real money was already spent on 5sim but the wallet
    -- charge failed - cancel the 5sim order so it isn't wasted.
    perform http_get(format('https://5sim.net/v1/user/cancel/%s', _provider_ref));
    raise;
  end;

  return _order;
end;
$function$;

revoke all on function public.buy_real_number(text, text) from public, anon;
grant execute on function public.buy_real_number(text, text) to authenticated;
