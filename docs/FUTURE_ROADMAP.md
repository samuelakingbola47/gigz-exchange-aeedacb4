# Gigz Exchange — Future Roadmap

## Phase 0 — Current state (done)

- Full premium UI: public site, customer dashboard, admin dashboard, all in ₦/NGN.
- Real authentication: register, login, 6-digit email OTP verification, password reset, protected and role-gated routes.
- Live PostgreSQL schema with hardened RLS; wallets start at ₦0; ledger is append-only.
- Orders are created and cancelled through atomic SECURITY DEFINER routines, currently in **demo mode** (`orders.is_demo = true`).
- Catalogue (services, countries) served from the database and editable by admins.
- Documentation pack in `/docs`.

**Not yet real:** number leasing, inbound SMS, wallet funding, branded email.

## Phase 1 — SMS provider integration

- Select a provider and store `SMS_PROVIDER_API_KEY` + `SMS_PROVIDER_WEBHOOK_SECRET` as server secrets.
- Server function to lease a number: reserve funds, call the provider, persist `provider_reference` and `phone_number`, set `is_demo = false`.
- Signature-verified webhook at `/api/public/sms-webhook` to write `sms_content` and the extracted `verification_code`, driving the radar panel from "listening" to "code received".
- Expiry and auto-refund job for orders that never receive an SMS.
- Admin provider page shows real health, balance and success rate.

## Phase 2 — Bank transfer & wallet funding

- Integrate a Nigerian payment provider (bank transfer / virtual accounts / card).
- Funding initiation server function + signature-verified `/api/public/payment-webhook`.
- Credits applied only through a SECURITY DEFINER routine that writes wallet + ledger atomically and is idempotent per provider reference.
- Admin views for reconciliation, manual adjustment (audited), and failed payments.

## Phase 3 — Domain & branded communications

- Connect the custom domain and enforce HTTPS.
- Verify the sending domain, then replace the default auth email with a branded Gigz Exchange OTP template that shows the 6-digit code.
- Branded transactional emails: order completed, wallet credited, refund issued, support reply.

## Phase 4 — Production launch

- Public API keys and metering for the dashboard API page.
- Pricing/margin controls, promotions, and per-service availability automation.
- Monitoring: error reporting, uptime checks, database health and slow-query review.
- Final security pass, load test on the purchase path, terms/privacy pages.
- Launch checklist: production smoke test of register → fund → buy → receive SMS → refund path, then go live.
