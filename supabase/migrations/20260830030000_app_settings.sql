-- ============================================================================
-- app_settings: a tiny table to hold values that change over time but
-- shouldn't require touching code to update - starting with the two
-- numbers needed for real-time SMS number pricing:
--   - usd_to_ngn_rate: current $ -> N conversion rate (update this
--     whenever the market rate moves meaningfully)
--   - default_markup_percent: your profit margin, as a decimal
--     (0.45 = 45%)
--
-- HOW TO UPDATE LATER (no code, no redeploy - just SQL, e.g. in the
-- Lovable Cloud SQL editor):
--   update public.app_settings set value = '1360' where key = 'usd_to_ngn_rate';
--
-- Kept as simple key/value text rows on purpose - easy to add more
-- settings later (e.g. a per-provider rate) without changing the table
-- shape.
-- ============================================================================

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value, description) values
  ('usd_to_ngn_rate', '1345', 'Current USD to NGN exchange rate, used to convert 5sim USD costs into Naira prices. Update this periodically as the market rate moves.'),
  ('default_markup_percent', '0.45', 'Default profit margin applied on top of provider cost, as a decimal (0.45 = 45%).')
on conflict (key) do nothing;

-- Lock this down the same way as everything else: only readable by
-- authenticated users (e.g. so an admin page could display current
-- settings), only writable by service_role / postgres. No public policy
-- needed for INSERT/UPDATE/DELETE since none exists - matching the same
-- "writes only through trusted server code" pattern used everywhere else.
alter table public.app_settings enable row level security;

create policy "Authenticated users can view settings"
  on public.app_settings
  for select
  to authenticated
  using (true);

-- --- verification (read-only) -----------------------------------------------
select key, value, description, updated_at from public.app_settings order by key;
