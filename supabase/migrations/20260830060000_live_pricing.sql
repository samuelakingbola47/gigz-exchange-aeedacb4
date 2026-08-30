-- ============================================================================
-- fivesim_quote_usd: small helper that gets the cheapest current USD price
-- from 5sim's public guest-prices endpoint (no API key needed - this
-- endpoint is unauthenticated). Returns NULL if nothing is in stock.
--
-- get_live_price: frontend-facing function. Takes our internal
-- country_code/service_code, converts the USD quote into Naira using
-- app_settings (exchange rate + markup), and reports whether it's in
-- stock. This is what the "Buy a number" page will call every time the
-- user picks a country+service, so they see a real, current price BEFORE
-- clicking purchase.
--
-- buy_real_number is updated (CREATE OR REPLACE) to call the same
-- fivesim_quote_usd helper for its own quote step, instead of repeating
-- the same logic twice - so pricing math only lives in one place.
-- ============================================================================

create or replace function public.fivesim_quote_usd(
  _country_slug text,
  _service_slug text
)
returns numeric
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _res http_response;
  _json jsonb;
  _cheapest numeric;
begin
  select * into _res from http_get(
    format('https://5sim.net/v1/guest/prices?country=%s&product=%s', _country_slug, _service_slug)
  );
  _json := _res.content::jsonb;

  select min((op.value->>'cost')::numeric) into _cheapest
  from jsonb_each(_json #> array[_country_slug, _service_slug]) as op
  where (op.value->>'count')::int > 0;

  return _cheapest; -- NULL if nothing in stock
end;
$function$;

revoke all on function public.fivesim_quote_usd(text, text) from public, anon;
grant execute on function public.fivesim_quote_usd(text, text) to authenticated;


create or replace function public.get_live_price(
  _country_code text,
  _service_code text
)
returns table(ngn_price numeric, in_stock boolean)
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  _country record;
  _service record;
  _usd_to_ngn numeric;
  _markup numeric;
  _usd numeric;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into _country from public.countries where country_code = _country_code and status = 'active';
  select * into _service from public.services where code = _service_code and status = 'active';

  if not found or _country.provider_country_slug is null or _service.provider_service_code is null then
    return query select null::numeric, false;
    return;
  end if;

  select value::numeric into _usd_to_ngn from public.app_settings where key = 'usd_to_ngn_rate';
  select value::numeric into _markup from public.app_settings where key = 'default_markup_percent';

  _usd := public.fivesim_quote_usd(_country.provider_country_slug, _service.provider_service_code);

  if _usd is null then
    return query select null::numeric, false;
  else
    return query select ceil(_usd * _usd_to_ngn * (1 + _markup)), true;
  end if;
end;
$function$;

revoke all on function public.get_live_price(text, text) from public, anon;
grant execute on function public.get_live_price(text, text) to authenticated;


-- --- refactor buy_real_number to reuse fivesim_quote_usd --------------------
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

  select * into _country from public.countries where country_code = _country_code and status = 'active';
  if not found then
    raise exception 'Country not available';
  end if;

  select * into _service from public.services where code = _service_code and status = 'active';
  if not found then
    raise exception 'Service not available';
  end if;

  if _country.provider_country_slug is null or _service.provider_service_code is null then
    raise exception 'This country/service is not yet configured for real purchases';
  end if;

  select value::numeric into _usd_to_ngn from public.app_settings where key = 'usd_to_ngn_rate';
  select value::numeric into _markup from public.app_settings where key = 'default_markup_percent';
  if _usd_to_ngn is null or _usd_to_ngn <= 0 then
    raise exception 'Pricing is not configured correctly';
  end if;

  select decrypted_secret into _api_key from vault.decrypted_secrets where name = 'fivesim_api_key';
  if _api_key is null then
    raise exception 'SMS provider is not configured';
  end if;

  -- Step 1: live quote (shared helper, no money spent yet)
  _cheapest_usd := public.fivesim_quote_usd(_country.provider_country_slug, _service.provider_service_code);
  if _cheapest_usd is null then
    raise exception 'No numbers currently in stock for this country/service';
  end if;
  _quoted_ngn := ceil(_cheapest_usd * _usd_to_ngn * (1 + _markup));

  -- Step 2: check wallet BEFORE spending real money on 5sim
  select balance into _wallet_balance from public.wallets where user_id = _uid;
  if not found then
    raise exception 'Wallet not found';
  end if;
  if _wallet_balance < _quoted_ngn then
    raise exception 'Insufficient wallet balance';
  end if;

  -- Step 3: actually buy the number from 5sim
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
    raise exception 'Provider error (status %): %', _buy_res.status, coalesce(_buy_res.content, '(empty response)');
  end if;

  _provider_ref := _buy_json->>'id';
  _phone := _buy_json->>'phone';
  _final_usd := (_buy_json->>'price')::numeric;
  _expires := (_buy_json->>'expires')::timestamptz;
  _final_ngn := ceil(_final_usd * _usd_to_ngn * (1 + _markup));

  -- Step 4: charge wallet + create order, atomically
  begin
    select * into _order from public.purchase_real_number(
      _uid, _country.name, _country.country_code,
      _service.name, _service.code,
      _phone, _final_ngn, _provider_ref, _expires
    );
  exception when others then
    perform http_get(format('https://5sim.net/v1/user/cancel/%s', _provider_ref));
    raise;
  end;

  return _order;
end;
$function$;

revoke all on function public.buy_real_number(text, text) from public, anon;
grant execute on function public.buy_real_number(text, text) to authenticated;
