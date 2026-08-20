# Gigz Exchange — Project Overview

## What Gigz Exchange is

Gigz Exchange is a digital **SMS verification platform**. Customers top up a Naira (₦/NGN) wallet, buy a temporary virtual phone number for a specific service (WhatsApp, Telegram, etc.) and country, and receive the verification SMS inside the dashboard. Staff manage the catalogue, orders, users and finances from an admin dashboard.

## Current project status

| Area | Status |
| --- | --- |
| Public marketing site | Complete |
| Design system (premium fintech, NGN currency) | Complete |
| Authentication (register / login / email OTP / password reset) | Complete, live |
| Database + RLS | Complete, live |
| Customer dashboard on live data | Complete |
| Admin dashboard on live data | Complete |
| Number purchase / SMS delivery | **Simulated** (demo RPCs, no SMS provider) |
| Wallet funding | **Simulated** (no payment provider) |
| Branded OTP email | Pending custom sending domain |

The app is a working product on real auth and a real database, with the two external integrations (SMS provider and payments) deliberately stubbed.

## Tech stack

- **Framework:** TanStack Start v1 (React 19, SSR, file-based routing via TanStack Router)
- **Build:** Vite 7/8
- **Styling:** Tailwind CSS v4 (`src/styles.css`, theme tokens in oklch), shadcn/ui + Radix primitives
- **Fonts:** Space Grotesk (headings), Plus Jakarta Sans (body)
- **Data layer:** TanStack Query v5
- **Backend:** Lovable Cloud (PostgreSQL, Auth, RLS, storage) via `@supabase/supabase-js`
- **Charts:** Recharts · **Icons:** lucide-react + react-icons · **Toasts:** sonner · **Validation:** zod

## Folder structure

```text
src/
  routes/                 file-based routes
    index.tsx             home
    services|countries|pricing|how-it-works|faq|contact.tsx
    login|register|forgot-password|reset-password|verify-email.tsx
    dashboard.tsx         customer shell (protected)
    dashboard.*.tsx       overview, buy, orders, history, wallet,
                          transactions, api, support, profile, settings
    admin.tsx             admin shell (role-gated)
    admin.*.tsx           overview, users, orders, transactions, payments,
                          services, countries, numbers, pricing, providers,
                          reports, support, settings
    __root.tsx            html shell, fonts, Toaster, global meta
  components/
    site/                 public layout, header, footer, hero, auth layout
    app/                  app shell, sidebar nav, stat cards, badges
    brand/                ServiceIcon, CountryFlag
    verify/               OtpVerification (cinematic account OTP)
    sms/                  SmsSessionPanel (radar listening state)
    ui/                   shadcn primitives
  lib/                    auth.tsx, queries.ts, currency.ts, format.ts, utils.ts
  integrations/supabase/  generated client, types, auth middleware (do not edit)
supabase/migrations/      SQL migration history
docs/                     this recovery & migration pack
```

## Completed features

- Public site: Home, Services, Countries, Pricing, How It Works, FAQ, Contact
- Email/password registration and login, 6-digit email OTP verification, password reset
- Protected customer routes and role-gated admin routes
- Wallet (₦0 start), transaction ledger, order lifecycle with demo purchase/cancel RPCs
- Live services and countries catalogue served from the database
- Admin suite with aggregate metrics and charts
- Full RLS hardening; no client-side writes to money or order tables

## Remaining features

1. Real SMS provider integration (number leasing, inbound SMS webhook)
2. Payment / bank-transfer funding of wallets
3. Custom sending domain + branded OTP and transactional emails
4. Public API keys and metered usage for the API page
5. Production launch: custom domain, monitoring, refund/expiry automation
