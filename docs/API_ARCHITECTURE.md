# Gigz Exchange — API & Backend Architecture

There is no separate API server. The app is a TanStack Start application that talks to Lovable Cloud (PostgreSQL + Auth) through the generated Supabase client, with business rules enforced in the database.

```text
React route component
  └─ TanStack Query hook (src/lib/queries.ts)
       └─ supabase-js client (RLS as the signed-in user)
            ├─ PostgREST table reads
            └─ RPC calls to SECURITY DEFINER functions (writes to money/orders)
```

## Client layer

`src/lib/auth.tsx`
- `useAuthUser()` — live session user.
- `useProfile()` — current user's `profiles` row.
- `useIsAdmin()` — RPC `has_role`.
- `useSignOut()` — cancel queries, clear cache, sign out, redirect.

`src/lib/queries.ts` — every data hook, all keyed by user id where relevant:
- Catalogue: `useServices()`, `useCountries()` (anon-readable).
- Customer: `useWallet()`, `useOrders(statuses?)`, `useTransactions()`, `useTickets()`, `useTicketMessages(ticketId)`.
- Mutations: purchase, cancel, ticket create, ticket reply, profile update — each invalidates the affected query keys so the dashboard refreshes without a reload.

## Database functions (the real backend)

| Routine | Kind | Purpose |
| --- | --- | --- |
| `handle_new_user()` | trigger, definer | On `auth.users` insert: create `profiles`, `wallets` (₦0, NGN) and `user_roles` (`customer`). |
| `has_role(_user_id uuid, _role app_role) → boolean` | definer, stable | Role check used by RLS policies and route guards without policy recursion. |
| `purchase_demo_number(_service_code text, _country_code text) → orders` | definer | Validates catalogue entry and price, checks wallet balance, debits wallet, writes a `debit` ledger row with before/after balances, inserts the order (`is_demo = true`, `status` waiting, `expires_at` set). All in one transaction; returns the order row. |
| `cancel_demo_order(_order_id uuid) → orders` | definer | Verifies the caller owns the order and it is cancellable, refunds the wallet, writes a `refund` ledger row, marks the order `cancelled`. Returns the updated order. |
| `touch_last_login()` | invoker | Stamps `profiles.last_login_at` after sign-in. |

Execute rights: `authenticated` only; `PUBLIC` and `anon` revoked. `handle_new_user` is trigger-only.

## Server-side flows in the app

- `src/routes/__root.tsx` — HTML shell, fonts, global meta, `<Toaster />`.
- `src/routes/dashboard.tsx` — `beforeLoad` session gate.
- `src/routes/admin.tsx` — `ssr: false`, session gate plus `has_role` admin gate, redirect to `/dashboard` otherwise.
- `src/start.ts` — TanStack Start instance; client `functionMiddleware` attaches the Supabase bearer token to any server function that needs auth.
- `src/server.ts` — SSR entry.

No `createServerFn` handlers and no edge functions are used yet: all current logic is either presentational or database-enforced.

## Where future integrations plug in

| Integration | Planned surface |
| --- | --- |
| SMS provider | server function to lease a number + `src/routes/api/public/sms-webhook.ts` (signature-verified) to receive inbound SMS and update `orders.sms_content` / `verification_code` |
| Payments / bank transfer | server function to initiate funding + `src/routes/api/public/payment-webhook.ts` writing a `credit` transaction through a definer routine |
| Public customer API | token-authenticated routes under `src/routes/api/` backing the dashboard API page |

Rules for those additions: external callers under `/api/public/*` must verify signatures inside the handler; wallet credits must go through a SECURITY DEFINER routine, never a direct table write.
