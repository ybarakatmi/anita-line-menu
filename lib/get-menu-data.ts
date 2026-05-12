import type { MenuDataMode, MenuItemRow, MenuSection, SiteSettingsRow } from "@/types/menu";
import {
  FALLBACK_MENU_ITEMS,
  FALLBACK_SITE_SETTINGS,
  withMenuSectionDefaults,
} from "@/lib/menu-fallback";
import { mergeSiteMediaFromEnv } from "@/lib/merge-site-media-env";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export type MenuPayload = {
  items: MenuItemRow[];
  settings: SiteSettingsRow;
  mode: MenuDataMode;
};

const MAX_MEDIA_URL_LEN = 4096;

/** Coerce DB quirks so RSC → client serialization and render never throw on bad shapes. */
function normalizeSiteSettingsRow(row: SiteSettingsRow): SiteSettingsRow {
  const fb = FALLBACK_SITE_SETTINGS;

  const clipUrl = (v: string | null | undefined): string | null => {
    const s = (v ?? "").trim();
    if (!s) return null;
    return s.length > MAX_MEDIA_URL_LEN ? s.slice(0, MAX_MEDIA_URL_LEN) : s;
  };

  const asText = (v: unknown, fallback: string): string => {
    if (v == null) return fallback;
    if (typeof v === "string") return v || fallback;
    const s = String(v);
    return s || fallback;
  };

  const asNullableText = (v: unknown): string | null => {
    if (v == null) return null;
    const s = typeof v === "string" ? v.trim() : String(v).trim();
    return s ? s : null;
  };

  let ticker: string[] = [...fb.ticker_segments];
  const raw = row.ticker_segments as unknown;
  if (Array.isArray(raw) && raw.length) {
    const next = raw.map((x) => (x == null ? "" : String(x))).filter((t) => t.length > 0);
    if (next.length) ticker = next;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length) {
        const next = parsed.map((x) => String(x ?? "")).filter((t) => t.length > 0);
        if (next.length) ticker = next;
      }
    } catch {
      /* keep default ticker */
    }
  }

  return {
    ...row,
    ticker_segments: ticker,
    hero_eyebrow: asNullableText(row.hero_eyebrow) ?? fb.hero_eyebrow,
    seasonal_tagline: asNullableText(row.seasonal_tagline),
    hero_secondary_label: clipUrl(row.hero_secondary_label),
    hero_secondary_href: clipUrl(row.hero_secondary_href),
    hero_video_url: clipUrl(row.hero_video_url),
    hero_video_poster_url: clipUrl(row.hero_video_poster_url),
    separator_video_url: clipUrl(row.separator_video_url),
    pastry_sec_the: asText(row.pastry_sec_the, fb.pastry_sec_the ?? ""),
    pastry_sec_big_line1: asText(row.pastry_sec_big_line1, fb.pastry_sec_big_line1 ?? ""),
    pastry_sec_big_line2: asText(row.pastry_sec_big_line2, fb.pastry_sec_big_line2 ?? ""),
    pastry_sec_tag: asText(row.pastry_sec_tag, fb.pastry_sec_tag ?? ""),
  };
}

const SECTION_ORDER: MenuSection[] = [
  "seasonal",
  "bestsellers",
  "coffee",
  "pastries",
  "drinks",
  "yogurt",
  "gelato",
  "sorbet",
];

function sortMenuItems(items: MenuItemRow[]) {
  return [...items].sort(
    (a, b) =>
      SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section) ||
      a.sort_order - b.sort_order
  );
}

async function loadMenuData(): Promise<MenuPayload> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      items: FALLBACK_MENU_ITEMS,
      settings: normalizeSiteSettingsRow(mergeSiteMediaFromEnv(FALLBACK_SITE_SETTINGS)),
      mode: "fallback",
    };
  }

  try {
    const supabase = await createClient();
    const [itemsRes, settingsRes] = await Promise.all([
      supabase
        .from("menu_items")
        .select("*")
        .eq("is_active", true)
        .order("section")
        .order("sort_order", { ascending: true }),
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    if (itemsRes.error) throw itemsRes.error;
    if (!itemsRes.data?.length) {
      return {
        items: FALLBACK_MENU_ITEMS,
        settings: normalizeSiteSettingsRow(mergeSiteMediaFromEnv(FALLBACK_SITE_SETTINGS)),
        mode: "fallback",
      };
    }

    const baseSettings: SiteSettingsRow =
      settingsRes.data && !settingsRes.error
        ? (settingsRes.data as SiteSettingsRow)
        : FALLBACK_SITE_SETTINGS;
    const settings = normalizeSiteSettingsRow(mergeSiteMediaFromEnv(baseSettings));

    const merged = withMenuSectionDefaults(itemsRes.data as MenuItemRow[]);
    return {
      items: sortMenuItems(merged),
      settings,
      mode: "live",
    };
  } catch {
    return {
      items: FALLBACK_MENU_ITEMS,
      settings: normalizeSiteSettingsRow(mergeSiteMediaFromEnv(FALLBACK_SITE_SETTINGS)),
      mode: "fallback",
    };
  }
}

/** One Supabase read per request when used from both `generateMetadata` and the page. */
export const getMenuData = cache(loadMenuData);
