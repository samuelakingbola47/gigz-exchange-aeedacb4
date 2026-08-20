# Gigz Exchange — Database Schema

All tables live in the `public` schema of the Lovable Cloud PostgreSQL database. Every table has RLS enabled. Money is stored in NGN.

Shared conventions: `id uuid primary key default gen_random_uuid()`, `created_at`/`updated_at timestamptz default now()`.

---

## profiles

One row per authenticated user, created automatically by the `handle_new_user` trigger on `auth.users`.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | equals `auth.users.id` |
| email | text | copied from auth at signup |
| full_name | text | from signup metadata |
| avatar_url | text null | |
| phone | text null | |
| country | text null | |
| timezone | text null | |
| status | text | `active` default |
| last_login_at | timestamptz null | set by `touch_last_login()` |
| created_at / updated_at | timestamptz | |

**Relationships:** `id → auth.users.id` (cascade delete). Logical parent of wallets, orders, tickets.
**Indexes:** PK on `id`.
**RLS:** user may `SELECT`/`UPDATE` own row (`auth.uid() = id`); admins may read all via `has_role(auth.uid(),'admin')`. No client `INSERT`/`DELETE`.

## user_roles

Roles are stored separately from profiles to prevent privilege escalation.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid | → `auth.users.id`, cascade |
| role | `app_role` enum | `customer` \| `admin` |
| created_at | timestamptz | |

**Indexes:** PK; unique `(user_id, role)`.
**RLS/Grants:** `SELECT` only for `authenticated` (own rows); all writes revoked from `anon`/`authenticated`; inserts happen through the signup trigger or `service_role`.

## wallets

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid | → `auth.users.id`, unique, cascade |
| balance | numeric | default `0` |
| currency | text | default `NGN` |
| created_at / updated_at | timestamptz | |

**Indexes:** PK; unique on `user_id`.
**RLS:** `SELECT` own wallet; admins read all. **No client insert/update/delete** — balance changes only through SECURITY DEFINER routines or `service_role`.

## wallet_transactions

Append-only ledger.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid | → `auth.users.id`, cascade |
| reference | text | unique human reference, auto-generated |
| type | text | `credit` \| `debit` \| `refund` |
| amount | numeric | positive magnitude |
| balance_before / balance_after | numeric | snapshot for audit |
| currency | text | default `NGN` |
| status | text | `success` default |
| description | text null | |
| created_at | timestamptz | |

**Indexes:** PK; unique `reference`; index on `(user_id, created_at desc)`.
**RLS:** `SELECT` own rows; admins read all. No client writes.

## orders

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid | → `auth.users.id`, cascade |
| order_reference | text | unique, auto-generated |
| service / service_code | text | denormalised from `services` |
| country / country_code | text | denormalised from `countries` |
| phone_number | text null | leased number |
| price | numeric | NGN charged |
| currency | text | default `NGN` |
| status | text | `pending` \| `waiting` \| `completed` \| `cancelled` \| `expired` |
| verification_code | text null | extracted OTP |
| sms_content | text null | raw inbound SMS |
| provider_reference | text null | future SMS-provider id |
| is_demo | boolean | true while no real provider is wired |
| expires_at | timestamptz null | |
| created_at / updated_at | timestamptz | |

**Indexes:** PK; unique `order_reference`; index on `(user_id, created_at desc)`; index on `status`.
**RLS:** `SELECT` own orders; admins read/update all. No client `INSERT`/`DELETE` — creation via `purchase_demo_number`, cancellation via `cancel_demo_order`.

## services

Public catalogue.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| code | text | unique service code (e.g. `whatsapp`) |
| name / description / icon | text | |
| category | text | |
| base_price | numeric | NGN |
| numbers_available | integer | |
| availability | text | `high` \| `medium` \| `low` |
| status | text | `active` \| `disabled` |
| created_at / updated_at | timestamptz | |

**Indexes:** PK; unique `code`.
**RLS:** `SELECT` to `anon` + `authenticated`; writes admin-only.

## countries

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| country_code | text | unique ISO code |
| name / region / flag / dial_code | text | |
| base_price | numeric | NGN |
| numbers_available | integer | |
| availability | text | |
| status | text | |
| created_at / updated_at | timestamptz | |

**Indexes:** PK; unique `country_code`.
**RLS:** `SELECT` public; writes admin-only.

## support_tickets

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid | → `auth.users.id`, cascade |
| ticket_reference | text | unique |
| subject / message | text | |
| category | text | e.g. `orders`, `wallet`, `technical` |
| priority | text | `low` \| `normal` \| `high` |
| status | text | `open` \| `pending` \| `closed` |
| created_at / updated_at | timestamptz | |

**Indexes:** PK; unique `ticket_reference`; index on `(user_id, created_at desc)`.
**RLS:** owner may select/insert/update own tickets; admins full read/update.

## support_messages

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| ticket_id | uuid | FK → `support_tickets.id`, cascade |
| user_id | uuid | author |
| message | text | |
| is_staff | boolean | true for admin replies |
| created_at | timestamptz | |

**Indexes:** PK; index on `(ticket_id, created_at)`.
**RLS:** readable/insertable by the ticket owner; admins full access.

---

## Relationship map

```text
auth.users 1─1 profiles
auth.users 1─1 wallets
auth.users 1─* wallet_transactions
auth.users 1─* orders
auth.users 1─* user_roles
auth.users 1─* support_tickets 1─* support_messages
services.code   ──logical──> orders.service_code
countries.code  ──logical──> orders.country_code
```

## RLS summary

| Table | anon | authenticated (own) | admin |
| --- | --- | --- | --- |
| profiles | – | select, update | select all |
| user_roles | – | select | select |
| wallets | – | select | select all |
| wallet_transactions | – | select | select all |
| orders | – | select | select, update all |
| services | select | select | full |
| countries | select | select | full |
| support_tickets | – | select, insert, update | full |
| support_messages | – | select, insert | full |

Table privileges (`GRANT`) are aligned with these policies, so a missing policy also means a missing grant — the design fails closed.
