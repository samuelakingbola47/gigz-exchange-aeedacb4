-- ============================================================================
-- SECURITY HARDENING (runs last)
--
-- Findings from the live-database audit this fixes:
--  1. Any logged-in user could edit ANY column of their own profile row,
--     including email_verified (skipping the email code) and status.
--     -> users may now edit only the columns the app actually uses.
--  2. anon/authenticated held broad default privileges (insert, delete,
--     truncate...) on most tables, relying on RLS alone.
--     -> everything is closed, then only what the app needs is re-opened.
--  3. fivesim_quote_usd was callable by any logged-in user.
--     -> now internal only (still used by get_live_price / buy_real_number).
--  Also applies your decision to charge a 100% markup.
-- ============================================================================

-- --- tables: close everything, then open only what the app needs --------------
revoke all on all tables in schema public from anon, authenticated;
grant all on all tables in schema public to service_role;

-- public website: country + service lists
grant select on public.countries, public.services to anon;

-- signed-in users: read access (RLS limits each user to their own rows)
grant select on
  public.countries, public.services, public.profiles, public.orders,
  public.wallets, public.wallet_transactions, public.user_roles,
  public.support_tickets, public.support_messages, public.app_settings
to authenticated;

-- admin-only writes (RLS policies restrict these to admins)
grant insert, update, delete on public.countries, public.services to authenticated;
grant update on public.orders to authenticated;
grant update on public.support_tickets to authenticated;

-- ordinary user writes
grant insert on public.support_tickets to authenticated;
grant insert on public.support_messages to authenticated;

-- profiles: users may change ONLY these columns (never email_verified / status / email)
grant update (full_name, phone, country, timezone, avatar_url, last_login_at)
  on public.profiles to authenticated;

-- --- functions: closed by default, then opened deliberately ----------------------
revoke all on function
  public.buy_real_number(text, text),
  public.cancel_demo_order(uuid),
  public.credit_wallet(uuid, numeric, text, text),
  public.fivesim_quote_usd(text, text),
  public.get_live_price(text, text),
  public.handle_new_user(),
  public.has_role(uuid, public.app_role),
  public.purchase_demo_number(text, text),
  public.purchase_real_number(uuid, text, text, text, text, text, numeric, text, timestamptz),
  public.request_email_verification(),
  public.touch_last_login(),
  public.update_updated_at_column(),
  public.verify_email_code(text)
from public, anon, authenticated;

-- callable by signed-in users
grant execute on function
  public.buy_real_number(text, text),
  public.cancel_demo_order(uuid),
  public.get_live_price(text, text),
  public.has_role(uuid, public.app_role),
  public.purchase_demo_number(text, text),
  public.request_email_verification(),
  public.touch_last_login(),
  public.verify_email_code(text)
to authenticated;

-- trusted server-side only
grant execute on function
  public.buy_real_number(text, text),
  public.cancel_demo_order(uuid),
  public.credit_wallet(uuid, numeric, text, text),
  public.fivesim_quote_usd(text, text),
  public.get_live_price(text, text),
  public.handle_new_user(),
  public.has_role(uuid, public.app_role),
  public.purchase_demo_number(text, text),
  public.purchase_real_number(uuid, text, text, text, text, text, numeric, text, timestamptz),
  public.request_email_verification(),
  public.touch_last_login(),
  public.update_updated_at_column(),
  public.verify_email_code(text)
to service_role;

-- --- pricing: your 100% markup ------------------------------------------------------
update public.app_settings
set value = '1.00', updated_at = now()
where key = 'default_markup_percent';
