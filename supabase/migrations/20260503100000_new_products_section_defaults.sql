-- Default copy for New products headings; migrate rows still on old “Pastries” title

alter table public.site_settings
  alter column pastry_sec_the set default 'Just in',
  alter column pastry_sec_big_line1 set default 'New',
  alter column pastry_sec_big_line2 set default 'Products',
  alter column pastry_sec_tag set default 'Pastries · Baked goods · Rotating picks';

update public.site_settings
set
  pastry_sec_the = 'Just in',
  pastry_sec_big_line1 = 'New',
  pastry_sec_big_line2 = 'Products',
  pastry_sec_tag = 'Pastries · Baked goods · Rotating picks',
  updated_at = now()
where id = 1
  and trim(coalesce(pastry_sec_big_line1, '')) ilike 'pastries'
  and trim(coalesce(pastry_sec_big_line2, '')) in ('& More', '&amp; More', 'More');
