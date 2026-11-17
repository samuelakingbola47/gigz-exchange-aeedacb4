-- ============================================================================
-- INITIAL SCHEMA (reconstructed from a full audit of the live database,
-- Nov 2026). The original base tables were created in Lovable's dashboard and
-- never saved as a migration, so this file captures them exactly:
-- tables, defaults, constraints, helper functions, the signup trigger,
-- RLS policies, indexes and updated_at triggers.
--
-- It is written to sort BEFORE the existing migrations. It deliberately
-- contains the ORIGINAL shape of each table; columns added later
-- (provider_country_slug, provider_service_code, email_verified) and the
-- app_settings / email_verifications tables come from the later migrations.
-- ============================================================================

-- --- role enum ---------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('customer', 'admin');
exception when duplicate_object then null;
end $$;

-- --- tables ------------------------------------------------------------------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  status text not null default 'active',
  phone text,
  country text,
  timezone text,
  avatar_url text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance numeric(14,2) not null default 0,
  currency text not null default 'NGN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  amount numeric(14,2) not null,
  balance_before numeric(14,2) not null default 0,
  balance_after numeric(14,2) not null default 0,
  currency text not null default 'NGN',
  reference text not null default concat('TX-', upper(substr(md5(random()::text), 1, 8))),
  description text,
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  constraint wallet_transactions_type_check
    check (type = any (array['deposit'::text, 'purchase'::text, 'refund'::text, 'adjustment'::text]))
);

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null unique,
  flag text,
  dial_code text,
  region text not null default 'Africa',
  base_price numeric(14,2) not null default 0,
  availability text not null default 'high',
  numbers_available integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  icon text,
  category text not null default 'Other',
  base_price numeric(14,2) not null default 0,
  availability text not null default 'high',
  numbers_available integer not null default 0,
  status text not null default 'active',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_reference text not null unique default concat('GX-', upper(substr(md5(random()::text), 1, 6))),
  country text not null,
  country_code text not null,
  service text not null,
  service_code text not null,
  phone_number text,
  price numeric(14,2) not null default 0,
  currency text not null default 'NGN',
  status text not null default 'waiting',
  sms_content text,
  verification_code text,
  provider_reference text,
  is_demo boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check
    check (status = any (array['waiting'::text, 'sms_received'::text, 'completed'::text, 'expired'::text, 'cancelled'::text]))
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticket_reference text not null unique default concat('TCK-', upper(substr(md5(random()::text), 1, 6))),
  subject text not null,
  category text not null default 'Other',
  priority text not null default 'Normal',
  message text not null default '',
  status text not null default 'Open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  is_staff boolean not null default false,
  created_at timestamptz not null default now()
);

-- --- indexes -------------------------------------------------------------------
create index if not exists idx_orders_user on public.orders using btree (user_id, created_at desc);
create index if not exists idx_wallet_tx_user on public.wallet_transactions using btree (user_id, created_at desc);

-- --- helper functions -----------------------------------------------------------
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Keeps updated_at current on every UPDATE (standard pattern; the original
-- function text was not captured, behaviour is identical).
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Signup trigger: exact copy of the live function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.email,''))
  on conflict (id) do nothing;

  insert into public.wallets (user_id, balance, currency)
  values (new.id, 0, 'NGN')
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id, role) do nothing;

  return new;
end;
$function$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --- updated_at triggers ----------------------------------------------------------
drop trigger if exists trg_countries_updated on public.countries;
create trigger trg_countries_updated before update on public.countries
  for each row execute function public.update_updated_at_column();
drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.update_updated_at_column();
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.update_updated_at_column();
drop trigger if exists trg_services_updated on public.services;
create trigger trg_services_updated before update on public.services
  for each row execute function public.update_updated_at_column();
drop trigger if exists trg_tickets_updated on public.support_tickets;
create trigger trg_tickets_updated before update on public.support_tickets
  for each row execute function public.update_updated_at_column();
drop trigger if exists trg_wallets_updated on public.wallets;
create trigger trg_wallets_updated before update on public.wallets
  for each row execute function public.update_updated_at_column();

-- --- row level security ------------------------------------------------------------
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.countries enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

-- countries
drop policy if exists "Admins manage countries" on public.countries;
create policy "Admins manage countries" on public.countries
  for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Anyone can view countries" on public.countries;
create policy "Anyone can view countries" on public.countries
  for select to public using (true);

-- services
drop policy if exists "Admins manage services" on public.services;
create policy "Admins manage services" on public.services
  for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Anyone can view services" on public.services;
create policy "Anyone can view services" on public.services
  for select to public using (true);

-- orders
drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders
  for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders" on public.orders
  for select to authenticated
  using ((auth.uid() = user_id) or has_role(auth.uid(), 'admin'::app_role));

-- profiles
drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile" on public.profiles
  for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
drop policy if exists "Users view own profile" on public.profiles;
create policy "Users view own profile" on public.profiles
  for select to authenticated
  using ((auth.uid() = id) or has_role(auth.uid(), 'admin'::app_role));

-- support tickets
drop policy if exists "Admins update tickets" on public.support_tickets;
create policy "Admins update tickets" on public.support_tickets
  for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Users create own tickets" on public.support_tickets;
create policy "Users create own tickets" on public.support_tickets
  for insert to authenticated
  with check (auth.uid() = user_id);
drop policy if exists "Users view own tickets" on public.support_tickets;
create policy "Users view own tickets" on public.support_tickets
  for select to authenticated
  using ((auth.uid() = user_id) or has_role(auth.uid(), 'admin'::app_role));

-- support messages
drop policy if exists "Users reply to own tickets" on public.support_messages;
create policy "Users reply to own tickets" on public.support_messages
  for insert to authenticated
  with check (
    (auth.uid() = user_id) and (
      has_role(auth.uid(), 'admin'::app_role) or exists (
        select 1 from public.support_tickets t
        where t.id = support_messages.ticket_id and t.user_id = auth.uid()
      )
    )
  );
drop policy if exists "Users view own ticket messages" on public.support_messages;
create policy "Users view own ticket messages" on public.support_messages
  for select to authenticated
  using (
    has_role(auth.uid(), 'admin'::app_role) or exists (
      select 1 from public.support_tickets t
      where t.id = support_messages.ticket_id and t.user_id = auth.uid()
    )
  );

-- roles, wallet, transactions
drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles" on public.user_roles
  for select to authenticated
  using ((auth.uid() = user_id) or has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Users view own wallet" on public.wallets;
create policy "Users view own wallet" on public.wallets
  for select to authenticated
  using ((auth.uid() = user_id) or has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Users view own transactions" on public.wallet_transactions;
create policy "Users view own transactions" on public.wallet_transactions
  for select to authenticated
  using ((auth.uid() = user_id) or has_role(auth.uid(), 'admin'::app_role));
