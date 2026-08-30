-- ============================================================================
-- Add new services: Upwork, Fiverr (Marketplace) + 6 dating apps (new
-- "Dating" category): Tinder, POF, Grindr, Match, MeetMe, Hinge.
--
-- All 8 codes below are confirmed to match 5sim's own product names exactly
-- (checked against 5sim's live product list, 2026-08-30) - no provider
-- naming mismatch like the earlier "x" -> "twitter" case, so
-- provider_service_code is simply set equal to code for all of them.
--
-- Styled to match existing rows:
--   - icon mirrors code (consistent with all 12 existing services)
--   - description follows the existing "{Category} verification" pattern
--   - pricing/availability/numbers_available are reasonable placeholder
--     estimates in the same range as comparable existing categories -
--     adjust freely once you've checked real 5sim pricing for each product
--
-- Safe to re-run: ON CONFLICT (code) DO NOTHING skips any row that already
-- exists, so running this twice by accident won't duplicate or error.
-- ============================================================================

insert into public.services
  (name, code, icon, category, base_price, availability, numbers_available, status, description, provider_service_code)
values
  ('Upwork',              'upwork',            'upwork',            'Marketplace', 690.00,  'medium', 3120,  'active', 'Marketplace verification', 'upwork'),
  ('Fiverr',              'fiverr',            'fiverr',            'Marketplace', 660.00,  'medium', 2890,  'active', 'Marketplace verification', 'fiverr'),
  ('Tinder',              'tinder',            'tinder',            'Dating',      585.00,  'high',   7460,  'active', 'Dating verification',      'tinder'),
  ('POF',                 'pof',               'pof',               'Dating',      450.00,  'medium', 2210,  'active', 'Dating verification',      'pof'),
  ('Grindr',              'grindr',            'grindr',            'Dating',      525.00,  'medium', 3040,  'active', 'Dating verification',      'grindr'),
  ('Match.com',           'match',             'match',             'Dating',      495.00,  'medium', 1870,  'active', 'Dating verification',      'match'),
  ('MeetMe',              'meetme',            'meetme',            'Dating',      420.00,  'low',    980,   'active', 'Dating verification',      'meetme'),
  ('Hinge',               'hinge',             'hinge',             'Dating',      540.00,  'medium', 2650,  'active', 'Dating verification',      'hinge')
on conflict (code) do nothing;

-- --- verification (read-only) -----------------------------------------------
select name, code, category, base_price, availability, provider_service_code, status
from public.services
where category in ('Marketplace', 'Dating')
order by category, name;
