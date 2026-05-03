-- Allow menu_items.section = 'yogurt' (keeps pastries + other sections from current schema).

alter table public.menu_items drop constraint if exists menu_items_section_check;

alter table public.menu_items add constraint menu_items_section_check check (
  section in (
    'seasonal',
    'bestsellers',
    'gelato',
    'sorbet',
    'coffee',
    'pastries',
    'drinks',
    'yogurt'
  )
);
