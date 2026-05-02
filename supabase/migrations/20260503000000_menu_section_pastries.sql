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
  add column if not exists pastry_sec_the text default 'Fresh each morning',
  add column if not exists pastry_sec_big_line1 text default 'Pastries',
  add column if not exists pastry_sec_big_line2 text default '& More',
  add column if not exists pastry_sec_tag text default 'Croissants · Danishes · Daily specials';
