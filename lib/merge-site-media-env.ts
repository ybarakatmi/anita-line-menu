import type { SiteSettingsRow } from "@/types/menu";

/** Official brand hero loop (same as anita-gelato.com Elementor). DB / env override when set. */
export const DEFAULT_BRAND_HERO_VIDEO_URL =
  "https://www.anita-gelato.com/wp-content/uploads/2024/06/hero.mp4";

/**
 * Hero / separator video URLs: DB wins, then Vercel env, then brand default for hero only.
 * For hosting-only reliability, mirror the MP4 to Supabase and set `NEXT_PUBLIC_HERO_VIDEO_URL` or DB field.
 */
export function mergeSiteMediaFromEnv(settings: SiteSettingsRow): SiteSettingsRow {
  const heroEnv = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim();
  const sepEnv = process.env.NEXT_PUBLIC_SEPARATOR_VIDEO_URL?.trim();
  return {
    ...settings,
    hero_video_url:
      settings.hero_video_url?.trim() || heroEnv || DEFAULT_BRAND_HERO_VIDEO_URL,
    separator_video_url: settings.separator_video_url?.trim() || sepEnv || null,
  };
}
