-- Secondary hero button (single-location friendly; defaults handled in app when null).

alter table public.site_settings
  add column if not exists hero_secondary_label text,
  add column if not exists hero_secondary_href text;
