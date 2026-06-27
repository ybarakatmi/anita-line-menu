-- Per-section heading overrides (eyebrow, title lines, tag) edited via /admin/sections

alter table public.site_settings
  add column if not exists section_labels jsonb;
