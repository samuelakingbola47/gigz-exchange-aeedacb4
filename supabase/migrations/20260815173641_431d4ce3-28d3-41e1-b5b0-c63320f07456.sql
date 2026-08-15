-- Secure demo purchase: deducts wallet, records transaction, creates order
CREATE OR REPLACE FUNCTION public.purchase_demo_number(_country_code text, _service_code text)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _country public.countries;
  _service public.services;
  _price numeric;
  _bal numeric;
  _order public.orders;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _country FROM public.countries WHERE country_code = _country_code AND status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Country not available'; END IF;

  SELECT * INTO _service FROM public.services WHERE code = _service_code AND status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Service not available'; END IF;

  _price := round(_country.base_price + _service.base_price, 2);

  SELECT balance INTO _bal FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found'; END IF;
  IF _bal < _price THEN RAISE EXCEPTION 'Insufficient wallet balance'; END IF;

  UPDATE public.wallets SET balance = _bal - _price, updated_at = now() WHERE user_id = _uid;

  INSERT INTO public.orders (user_id, country, country_code, service, service_code, phone_number, price, currency, status, is_demo, expires_at)
  VALUES (_uid, _country.name, _country.country_code, _service.name, _service.code,
          concat(coalesce(_country.dial_code, '+000'), ' ', lpad((floor(random()*900000000)+100000000)::bigint::text, 9, '0')),
          _price, 'NGN', 'waiting', true, now() + interval '20 minutes')
  RETURNING * INTO _order;

  INSERT INTO public.wallet_transactions (user_id, type, amount, balance_before, balance_after, currency, description, status)
  VALUES (_uid, 'purchase', -_price, _bal, _bal - _price, 'NGN',
          concat(_service.name, ' · ', _country.name, ' (', _order.order_reference, ')'), 'completed');

  RETURN _order;
END; $$;

REVOKE ALL ON FUNCTION public.purchase_demo_number(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.purchase_demo_number(text, text) TO authenticated;

-- Secure cancel + refund of a waiting demo order
CREATE OR REPLACE FUNCTION public.cancel_demo_order(_order_id uuid)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _order public.orders;
  _bal numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO _order FROM public.orders WHERE id = _order_id AND user_id = _uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF _order.status NOT IN ('waiting', 'sms_received') THEN RAISE EXCEPTION 'Order can no longer be cancelled'; END IF;

  UPDATE public.orders SET status = 'cancelled', updated_at = now() WHERE id = _order.id RETURNING * INTO _order;

  SELECT balance INTO _bal FROM public.wallets WHERE user_id = _uid FOR UPDATE;
  UPDATE public.wallets SET balance = _bal + _order.price, updated_at = now() WHERE user_id = _uid;

  INSERT INTO public.wallet_transactions (user_id, type, amount, balance_before, balance_after, currency, description, status)
  VALUES (_uid, 'refund', _order.price, _bal, _bal + _order.price, 'NGN',
          concat('Refund for cancelled order ', _order.order_reference), 'completed');

  RETURN _order;
END; $$;

REVOKE ALL ON FUNCTION public.cancel_demo_order(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.cancel_demo_order(uuid) TO authenticated;

-- Record last login timestamp
CREATE OR REPLACE FUNCTION public.touch_last_login()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles SET last_login_at = now() WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.touch_last_login() FROM public;
GRANT EXECUTE ON FUNCTION public.touch_last_login() TO authenticated;
