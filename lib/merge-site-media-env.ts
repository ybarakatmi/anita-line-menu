import type { SiteSettingsRow } from "@/types/menu";

/** anita-gelato.com MP4s are often CORP-blocked for cross-origin `<video>` — ignore saved hotlinks. */
function isBlockedAnitaMp4Hotlink(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    return host === "anita-gelato.com" && /\.mp4(\?|#|$)/i.test(u.pathname + u.search);
  } catch {
    return false;
  }
}

/** Object path when uploading to Supabase `menu-images` (see `scripts/upload-hero-to-supabase.ts`). */
export const HERO_STORAGE_OBJECT_PATH = "hero.mp4";

/**
 * Default hero MP4 served from this app (same origin — avoids CDN CORP blocks on third-party hosts).
 * Replace `public/hero.mp4` with your loop and redeploy, or set `hero_video_url` in Admin / env.
 */
export const BUNDLED_HERO_VIDEO_PATH = "/hero.mp4";

/**
 * Hero / separator: DB wins, then env, then same bundled `/hero.mp4` (one file; replace in `public/` and redeploy).
 */
export function mergeSiteMediaFromEnv(settings: SiteSettingsRow): SiteSettingsRow {
  const heroEnv = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim();
  const sepEnv = process.env.NEXT_PUBLIC_SEPARATOR_VIDEO_URL?.trim();
  const posterEnv = process.env.NEXT_PUBLIC_HERO_VIDEO_POSTER_URL?.trim();
  const rawHero = settings.hero_video_url?.trim() ?? "";
  const dbHero = rawHero && !isBlockedAnitaMp4Hotlink(rawHero) ? rawHero : "";
  const rawSep = settings.separator_video_url?.trim() ?? "";
  const dbSep = rawSep && !isBlockedAnitaMp4Hotlink(rawSep) ? rawSep : "";
  const rawPoster = settings.hero_video_poster_url?.trim() ?? "";
  const dbPoster = rawPoster || "";
  return {
    ...settings,
    hero_video_url: dbHero || heroEnv || BUNDLED_HERO_VIDEO_PATH,
    hero_video_poster_url: posterEnv || dbPoster || null,
    hero_bg_image_url: settings.hero_bg_image_url?.trim() || null,
    separator_video_url: dbSep || sepEnv || BUNDLED_HERO_VIDEO_PATH,
  };
}
