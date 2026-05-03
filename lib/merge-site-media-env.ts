import type { SiteSettingsRow } from "@/types/menu";

/** Fixed object path in the public `menu-images` bucket (see `scripts/upload-hero-to-supabase.ts`). */
export const HERO_STORAGE_OBJECT_PATH = "hero.mp4";

/**
 * Default public URL for the hero loop on this Supabase project (no DB / env needed once the file exists).
 * Storage must allow anonymous read (bucket `menu-images` is public in migrations).
 */
export function getDefaultSupabaseHeroVideoUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/menu-images/${HERO_STORAGE_OBJECT_PATH}`;
}

/**
 * Hero / separator video URLs: DB wins, then `NEXT_PUBLIC_HERO_VIDEO_URL`, then the conventional
 * Supabase Storage URL above. Do not hotlink third-party MP4s: many CDNs send `Cross-Origin-Resource-Policy:
 * same-origin`, which blocks playback on other sites (poster still only).
 */
export function mergeSiteMediaFromEnv(settings: SiteSettingsRow): SiteSettingsRow {
  const heroEnv = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim();
  const sepEnv = process.env.NEXT_PUBLIC_SEPARATOR_VIDEO_URL?.trim();
  const defaultHero = getDefaultSupabaseHeroVideoUrl();
  return {
    ...settings,
    hero_video_url: settings.hero_video_url?.trim() || heroEnv || defaultHero,
    separator_video_url: settings.separator_video_url?.trim() || sepEnv || null,
  };
}
