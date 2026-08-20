# Gigz Exchange — Authentication Flow

Auth is provided by Lovable Cloud Auth (Supabase Auth) using email + password with a **6-digit email OTP** confirmation. The browser client is `src/integrations/supabase/client.ts` (auto-generated, never edit). Client-side helpers live in `src/lib/auth.tsx`.

## Register — `/register`

1. Collects **Full name, Email, Password** (zod-validated, react-hook-form).
2. Calls `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`.
3. A database trigger `handle_new_user()` runs on the new `auth.users` row and creates:
   - a `profiles` row (email, full name, `status = active`),
   - a `wallets` row with `balance = 0`, `currency = NGN`,
   - a `user_roles` row with role `customer`.
4. Email confirmation is **enabled** (no auto-confirm, no anonymous sign-ups), so the user is redirected to `/verify-email?email=...`.

## Email verification — `/verify-email`

- Renders `OtpVerification` (cinematic 6-digit input, orbital animation, shake on failure, success spark).
- Verifies with `supabase.auth.verifyOtp({ email, token, type: "email" })` — a real provider check, never a local comparison.
- Success → a real session exists → navigate to `/dashboard`.
- Failure → mapped messages: invalid code, code expired (>60 min), or rate-limited (429 / `over_email_send_rate_limit`).
- Resend uses `supabase.auth.resend({ type: "signup", email })` behind a 60-second cooldown.

> **Branded OTP emails require a custom sending domain.** Until a domain you own is verified in project email settings, the platform sends the default provider email. Once the domain is verified, the auth email template can be replaced with a branded Gigz Exchange OTP email that displays the 6-digit code prominently.

This account-verification OTP is deliberately separate from the SMS product flow: inbound SMS codes are displayed by `SmsSessionPanel` (radar listening UI) on the Buy Number screen and never reuse this component's semantics.

## Login — `/login`

- Cinematic glassmorphism page with 3D parallax tilt.
- `supabase.auth.signInWithPassword({ email, password })`.
- Unconfirmed accounts are routed back to `/verify-email` with the address prefilled.
- After a session is established, `touch_last_login()` updates `profiles.last_login_at`, then the user lands on `/dashboard` (admins can open `/admin`).

## Password reset

- `/forgot-password` → `supabase.auth.resetPasswordForEmail(email, { redirectTo: ${window.location.origin}/reset-password })`.
- `/reset-password` reads the recovery session from the URL and calls `supabase.auth.updateUser({ password })`, then redirects to `/login`.

## Session handling

- Sessions are persisted and auto-refreshed by the generated Supabase client.
- `useAuthUser()` seeds state from `supabase.auth.getSession()` and subscribes to `onAuthStateChange`, unsubscribing on unmount.
- `useProfile()` and `useIsAdmin()` (RPC `has_role`) are TanStack Query hooks keyed by user id.
- `useSignOut()` cancels in-flight queries, clears the query cache, calls `supabase.auth.signOut()`, and navigates to `/login` — no stale data survives a logout.
- All reads run under RLS as the signed-in user; there is no privileged client key in the browser.

## Protected routes

| Route subtree | Gate |
| --- | --- |
| `/dashboard/*` | `beforeLoad` requires a session, otherwise `redirect({ to: "/login" })` |
| `/admin/*` | requires a session **and** `has_role(user.id, 'admin')` returning true; non-admins are redirected to `/dashboard` |
| public pages | open |

Role checks are always executed in the database through the `has_role` SECURITY DEFINER function. Roles are never read from localStorage, client state, or the profile row.
