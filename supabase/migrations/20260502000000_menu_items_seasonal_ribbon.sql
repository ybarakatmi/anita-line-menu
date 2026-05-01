-- Optional override for the diagonal corner ribbon on New & Seasonal cards only.
-- When null, the menu uses automatic labels (Limited when badge mentions limited, else Seasonal).

alter table public.menu_items
  add column if not exists seasonal_ribbon_label text;
