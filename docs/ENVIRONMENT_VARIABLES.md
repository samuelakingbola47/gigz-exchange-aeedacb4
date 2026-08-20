# Gigz Exchange — Environment Variables

Names and purposes only. **Never commit real values.** Secrets belong in the hosting provider's environment settings.

## Client (browser-exposed, safe to publish)

Any variable prefixed `VITE_` is inlined into the browser bundle.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Base URL of the Lovable Cloud / Supabase project the frontend talks to. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key. Read-restricted by RLS; safe in client code. |
| `VITE_SUPABASE_PROJECT_ID` | Project reference id, used by tooling and type generation. |

## Server runtime

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Project URL for SSR and server functions. |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key for server-side public reads (no session persistence). |
| `SUPABASE_PROJECT_ID` | Project reference id for server tooling. |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged key that bypasses RLS. Only required if you self-host and add admin-only server logic. Server-only; never expose to the browser. Not retrievable inside Lovable Cloud. |

## Reserved for planned integrations (not used yet)

| Variable | Purpose |
| --- | --- |
| `SMS_PROVIDER_API_KEY` | Authenticates outbound calls to the future SMS/number provider. |
| `SMS_PROVIDER_WEBHOOK_SECRET` | Verifies the signature of inbound SMS webhooks. |
| `PAYMENT_PROVIDER_SECRET_KEY` | Server-side key for the wallet funding provider. |
| `PAYMENT_WEBHOOK_SECRET` | Verifies payment/bank-transfer webhook signatures. |
| `EMAIL_SENDING_DOMAIN` | Verified domain used for branded OTP and transactional email. |
| `RESEND_API_KEY` (or chosen provider key) | Sends branded transactional email once a domain is verified. |

## Rules

1. `process.env.*` is server-only and must be read **inside** a handler, not at module scope.
2. Browser code reads config through `import.meta.env.VITE_*` only.
3. Rotate any key that is ever pasted into a chat, log, screenshot, or client bundle.
4. Keep `.env` out of version control; ship a `.env.example` with names only.
