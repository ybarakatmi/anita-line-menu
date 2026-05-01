-- Hero / separator videos must be served from a host that allows playback from your domain
-- (e.g. Supabase Storage). Hotlinked MP4s from some origins are blocked by CDN rules.

alter table public.site_settings
  add column if not exists hero_video_url text,
  add column if not exists hero_video_poster_url text,
  add column if not exists separator_video_url text;
