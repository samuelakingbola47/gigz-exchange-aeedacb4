CREATE OR REPLACE FUNCTION public.touch_last_login()
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  UPDATE public.profiles SET last_login_at = now() WHERE id = auth.uid();
$function$;

REVOKE ALL ON FUNCTION public.touch_last_login() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.touch_last_login() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.purchase_demo_number(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_demo_order(uuid) FROM PUBLIC, anon;