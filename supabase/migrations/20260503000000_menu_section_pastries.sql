-- Pastries / morning specials section (items use menu_items.section = 'pastries')

alter table public.menu_items drop constraint if exists menu_items_section_check;

alter table public.menu_items add constraint menu_items_section_check check (
  section in (
    'seasonal',
    'bestsellers',
    'gelato',
    'sorbet',
    'coffee',
    'pastries',
    'drinks'
  )
);

alter table public.site_settings
  add column if not exists pastry_sec_the text default 'Just in',
  add column if not exists pastry_sec_big_line1 text default 'New',
  add column if not exists pastry_sec_big_line2 text default 'Products',
  add column if not exists pastry_sec_tag text default 'Pastries · Baked goods · Rotating picks';
