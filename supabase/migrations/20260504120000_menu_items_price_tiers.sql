-- Optional per-item pricing tiers for the public detail sheet (tap-to-expand).
-- Shape: [{"label": "Single scoop", "price": "from $7", "hint": "Optional note"}]
-- NULL = use built-in defaults by section in `getPriceTiersForItem` (app code).

alter table public.menu_items
  add column if not exists price_tiers jsonb;

comment on column public.menu_items.price_tiers is
  'JSON array of {label, price, hint?} for popup pricing. Null = app defaults by section.';
