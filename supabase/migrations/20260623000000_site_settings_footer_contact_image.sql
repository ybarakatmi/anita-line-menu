-- Footer contact form photo (below SEND button on public menu)

alter table public.site_settings
  add column if not exists footer_contact_image_url text;
