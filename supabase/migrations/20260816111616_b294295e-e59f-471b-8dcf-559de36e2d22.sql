-- 1) Align table privileges with RLS policies (no client-side writes to money/order tables)
REVOKE ALL ON public.orders FROM anon, authenticated;
REVOKE ALL ON public.wallets FROM anon, authenticated;
REVOKE ALL ON public.wallet_transactions FROM anon, authenticated;

GRANT SELECT, UPDATE ON public.orders TO authenticated; -- UPDATE gated by the admin-only policy
GRANT SELECT ON public.wallets TO authenticated;
GRANT SELECT ON public.wallet_transactions TO authenticated;

GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.wallets TO service_role;
GRANT ALL ON public.wallet_transactions TO service_role;

-- 2) Restrict SECURITY DEFINER functions to signed-in callers only
REVOKE ALL ON FUNCTION public.purchase_demo_number(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_demo_order(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.touch_last_login() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.purchase_demo_number(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_demo_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_last_login() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 3) has_role: signed-in users may only probe their own roles (admins may probe anyone)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
