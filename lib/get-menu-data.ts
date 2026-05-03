import type { MenuDataMode, MenuItemRow, MenuSection, SiteSettingsRow } from "@/types/menu";
import {
  FALLBACK_MENU_ITEMS,
  FALLBACK_SITE_SETTINGS,
  withDefaultNewProductsIfEmpty,
} from "@/lib/menu-fallback";
import { mergeSiteMediaFromEnv } from "@/lib/merge-site-media-env";
import { createClient } from "@/lib/supabase/server";

export type MenuPayload = {
  items: MenuItemRow[];
  settings: SiteSettingsRow;
  mode: MenuDataMode;
};

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

export async function getMenuData(): Promise<MenuPayload> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      items: FALLBACK_MENU_ITEMS,
      settings: mergeSiteMediaFromEnv(FALLBACK_SITE_SETTINGS),
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
        settings: mergeSiteMediaFromEnv(FALLBACK_SITE_SETTINGS),
        mode: "fallback",
      };
    }

    const baseSettings: SiteSettingsRow =
      settingsRes.data && !settingsRes.error
        ? (settingsRes.data as SiteSettingsRow)
        : FALLBACK_SITE_SETTINGS;
    const settings = mergeSiteMediaFromEnv(baseSettings);

    const merged = withDefaultNewProductsIfEmpty(itemsRes.data as MenuItemRow[]);
    return {
      items: sortMenuItems(merged),
      settings,
      mode: "live",
    };
  } catch {
    return {
      items: FALLBACK_MENU_ITEMS,
      settings: mergeSiteMediaFromEnv(FALLBACK_SITE_SETTINGS),
      mode: "fallback",
    };
  }
}
