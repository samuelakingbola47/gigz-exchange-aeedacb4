-- ============================================================================
-- Add provider-specific mapping columns to countries and services
--
-- WHY: 5sim identifies countries/products by its own slugs, which don't
-- always match our internal country_code (ISO alpha-2) or service code.
-- Rather than hardcoding a translation table inside application/Edge
-- Function code, we store the correct provider value directly on each row,
-- so it's visible, editable via normal admin tooling later, and easy to
-- extend if a second SMS provider with different naming is added someday.
--
-- Confirmed mappings (checked against 5sim's live /v1/guest/countries and
-- product list, 2026-08-30):
--   - All 12 existing countries need a slug (our country_code is ISO
--     alpha-2, 5sim wants full lowercase country names).
--   - uk -> "england" and us -> "usa" are the two non-obvious ones.
--   - 11 of 12 services already match 5sim's product name exactly.
--   - Only "x" (Twitter/X) differs -> 5sim still calls it "twitter".
-- ============================================================================

-- --- countries: add + populate provider_country_slug -----------------------
alter table public.countries
  add column if not exists provider_country_slug text;

update public.countries set provider_country_slug = case country_code
  when 'au' then 'australia'
  when 'br' then 'brazil'
  when 'ca' then 'canada'
  when 'fr' then 'france'
  when 'de' then 'germany'
  when 'in' then 'india'
  when 'id' then 'indonesia'
  when 'nl' then 'netherlands'
  when 'ng' then 'nigeria'
  when 'za' then 'southafrica'
  when 'uk' then 'england'
  when 'us' then 'usa'
  else null  -- any future country added without a mapping will show up
             -- as NULL here rather than silently guessing wrong
end
where country_code in ('au','br','ca','fr','de','in','id','nl','ng','za','uk','us');

-- --- services: add + populate provider_service_code -------------------------
alter table public.services
  add column if not exists provider_service_code text;

-- Default: same as our own code (true for 11 of 12 services)
update public.services
set provider_service_code = code
where provider_service_code is null;

-- Override the one known mismatch
update public.services
set provider_service_code = 'twitter'
where code = 'x';

-- --- verification (read-only) -----------------------------------------------
select country_code, name, provider_country_slug from public.countries order by name;
select code, name, provider_service_code from public.services order by name;
