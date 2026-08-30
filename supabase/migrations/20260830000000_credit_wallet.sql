-- ============================================================================
-- credit_wallet
-- Purpose: Safely add funds to a user's wallet, e.g. after a payment provider
--          confirms a successful deposit via webhook.
--
-- Modeled directly on the existing cancel_demo_order pattern:
--   - SECURITY DEFINER (runs with elevated privilege, bypassing RLS,
--     the same way purchase_demo_number / cancel_demo_order already do)
--   - Locks the wallet row with FOR UPDATE before touching the balance,
--     preventing two simultaneous credits from racing each other
--   - Writes to wallets + wallet_transactions atomically, in one transaction
--   - search_path pinned to 'public' (same hardening as every existing fn)
--
-- KEY DIFFERENCE from purchase_demo_number/cancel_demo_order:
--   Those two use auth.uid() because they're called BY the logged-in user
--   themselves (client calls them directly). credit_wallet is meant to be
--   called FROM YOUR SERVER (e.g. a payment webhook handler) on behalf of
--   a user, so it takes _user_id as an explicit parameter instead, and is
--   granted ONLY to service_role - never to authenticated or anon. A
--   regular logged-in user calling this directly should be impossible.
--
-- IDEMPOTENCY:
--   _provider_reference must be unique per real-world payment (e.g. the
--   payment provider's transaction ID). If a webhook fires twice for the
--   same payment (which providers do on purpose, as a reliability feature),
--   this function detects the duplicate reference and safely does nothing
--   the second time, rather than crediting the wallet twice.
-- ============================================================================

create or replace function public.credit_wallet(
  _user_id uuid,
  _amount numeric,
  _provider_reference text,
  _description text default null
)
returns public.wallet_transactions
language plpgsql
security definer
set search_path = public
as $function$
declare
  _bal numeric;
  _existing public.wallet_transactions;
  _txn public.wallet_transactions;
begin
  -- Basic input validation: never allow a zero or negative credit.
  if _amount is null or _amount <= 0 then
    raise exception 'Credit amount must be greater than zero';
  end if;

  if _provider_reference is null or length(trim(_provider_reference)) = 0 then
    raise exception 'A provider_reference is required for idempotency';
  end if;

  -- Idempotency guard: if we've already recorded a transaction with this
  -- exact provider_reference, return the existing row instead of crediting
  -- again. This makes it safe for a webhook to retry/replay.
  select * into _existing
  from public.wallet_transactions
  where reference = _provider_reference
  limit 1;

  if found then
    return _existing;
  end if;

  -- Lock the wallet row so a concurrent credit/debit can't race this one.
  select balance into _bal
  from public.wallets
  where user_id = _user_id
  for update;

  if not found then
    raise exception 'Wallet not found for user %', _user_id;
  end if;

  update public.wallets
  set balance = _bal + _amount,
      updated_at = now()
  where user_id = _user_id;

  insert into public.wallet_transactions (
    user_id, type, amount, balance_before, balance_after,
    currency, reference, description, status
  )
  values (
    _user_id, 'credit', _amount, _bal, _bal + _amount,
    'NGN', _provider_reference,
    coalesce(_description, 'Wallet funding'), 'completed'
  )
  returning * into _txn;

  return _txn;
end;
$function$;

-- Lock down who can call this. Only service_role (i.e. your own trusted
-- server/webhook code, never the browser) may execute it.
revoke all on function public.credit_wallet(uuid, numeric, text, text) from public, anon, authenticated;
grant execute on function public.credit_wallet(uuid, numeric, text, text) to service_role;
