REVOKE EXECUTE ON FUNCTION public.purchase_demo_number(text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cancel_demo_order(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.touch_last_login() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_demo_number(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_demo_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_last_login() TO authenticated;