# Gigz Exchange — Security Model

The security posture is **fail-closed**: every public table has RLS enabled, table privileges are aligned with the policies, and anything not explicitly allowed is denied.

## RLS policies

- RLS is enabled on `profiles`, `user_roles`, `wallets`, `wallet_transactions`, `orders`, `services`, `countries`, `support_tickets`, `support_messages`.
- Ownership predicate is always `auth.uid() = user_id` (or `= id` for `profiles`).
- Admin access uses `public.has_role(auth.uid(), 'admin')` — never a column on `profiles`.
- Public catalogue (`services`, `countries`) is the only `anon`-readable data.
- Grants mirror the policies, e.g.:
  ```sql
  REVOKE ALL ON public.wallets FROM anon, authenticated;
  GRANT SELECT ON public.wallets TO authenticated;
  GRANT ALL   ON public.wallets TO service_role;
  ```

## Role storage

Roles live in a dedicated `user_roles` table with a `app_role` enum (`customer`, `admin`) and a unique `(user_id, role)` constraint. `authenticated` has `SELECT` only; every write privilege is revoked, so a user cannot grant themselves `admin`.

## Wallet protection

- `wallets` and `wallet_transactions` expose **read-only** access to the owner.
- No `INSERT`, `UPDATE` or `DELETE` policy or grant exists for `anon` or `authenticated`.
- Balance mutations occur only inside SECURITY DEFINER routines that write the debit and the ledger row in one transaction, recording `balance_before` and `balance_after`.
- The ledger is append-only; there is no client path that can edit history.

## Order protection

- `orders` allows the owner `SELECT` only; admins may additionally `UPDATE`.
- Orders are created exclusively by `purchase_demo_number(_service_code, _country_code)` which validates the catalogue entry, checks funds, debits the wallet, writes the transaction, and inserts the order atomically.
- Cancellation/refund runs through `cancel_demo_order(_order_id)`, which verifies ownership and refunds in the same transaction.
- This prevents forged prices, free orders, and orphaned refunds.

## SECURITY DEFINER functions

| Function | Why definer | Exposure |
| --- | --- | --- |
| `has_role(uuid, app_role)` | must read `user_roles` without triggering recursive RLS in policies | `EXECUTE` to `authenticated` only |
| `purchase_demo_number(text, text)` | atomic debit + ledger + order insert that clients are not allowed to perform directly | `EXECUTE` to `authenticated` only |
| `cancel_demo_order(uuid)` | atomic refund + order status change, ownership checked inside | `EXECUTE` to `authenticated` only |
| `handle_new_user()` | signup trigger creating profile/wallet/role | `EXECUTE` revoked from `PUBLIC`, `anon`, `authenticated` |

`touch_last_login()` was converted to **SECURITY INVOKER** so it runs with the caller's privileges under RLS. All routines have `set search_path = public` and `EXECUTE` revoked from `PUBLIC` and `anon`.

## Why the remaining scanner warnings are intentional

1. **"SECURITY DEFINER functions executable by authenticated users."** The three remaining definer functions are the *only* sanctioned write path for money and orders. They must bypass RLS to do their job, they validate ownership and funds internally, and `anon`/`PUBLIC` execute rights are revoked. Removing definer status would either break role checks (policy recursion) or force wallet-write grants to the client — strictly worse.
2. **"orders has no user insert/delete policy."** Intentional. Clients must not create or delete orders; `purchase_demo_number` / `cancel_demo_order` own that lifecycle.
3. **"wallets / wallet_transactions have no write policies."** Intentional. Users may never change their own balance or edit the ledger.

These are documented in the project security memory so future scans do not "fix" them by widening access.

## Other practices

- No service-role key or database password is available to the frontend or to Lovable Cloud users.
- Frontend reads only `VITE_SUPABASE_*` publishable values, which are safe to ship.
- Admin gating happens in `beforeLoad` **and** in the database — UI hiding is never the control.
