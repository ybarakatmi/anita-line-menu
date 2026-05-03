import type { SiteSettingsRow } from "@/types/menu";

/**
 * Optional deploy-time defaults for background MP4s (e.g. Supabase Storage public URLs).
 * Database values win when set — paste URLs in Admin → Settings to override per project.
 */
export function mergeSiteMediaFromEnv(settings: SiteSettingsRow): SiteSettingsRow {
  const heroEnv = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim();
  const sepEnv = process.env.NEXT_PUBLIC_SEPARATOR_VIDEO_URL?.trim();
  return {
    ...settings,
    hero_video_url: settings.hero_video_url?.trim() || heroEnv || null,
    separator_video_url: settings.separator_video_url?.trim() || sepEnv || null,
  };
}
