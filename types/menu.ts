export type MenuSection =
  | "seasonal"
  | "bestsellers"
  | "gelato"
  | "sorbet"
  | "coffee"
  | "pastries"
  | "drinks"
  | "yogurt";

/** One row in the public “tap for details” pricing list (stored as JSON on `menu_items.price_tiers`). */
export type MenuPriceTier = {
  label: string;
  price: string;
  hint?: string;
};

export type MenuItemRow = {
  id: string;
  section: MenuSection;
  name: string;
  description: string | null;
  price_display: string | null;
  emoji: string | null;
  image_url: string | null;
  tags: string[] | null;
  badge: string | null;
  is_new: boolean;
  is_fave: boolean;
  is_vegan: boolean;
  sort_order: number;
  is_active: boolean;
  promo_label: string | null;
  /** New & Seasonal section only: corner ribbon text; null uses auto Seasonal/Limited from badge. */
  seasonal_ribbon_label: string | null;
  /**
   * Custom pricing tiers for the detail sheet. Null/omitted = app uses section defaults.
   * Supabase column `price_tiers` (jsonb).
   */
  price_tiers?: MenuPriceTier[] | null;
  /** Present when loaded from Supabase */
  created_at?: string;
  updated_at?: string;
};

export type SiteSettingsRow = {
  id: number;
  ticker_segments: string[];
  seasonal_tagline: string | null;
  hero_eyebrow: string | null;
  /** MP4 URL allowed for cross-origin playback (e.g. Supabase Storage public URL). */
  hero_video_url: string | null;
  hero_video_poster_url: string | null;
  separator_video_url: string | null;
  /** Hero outline button (right): label + link — null uses Tarzana defaults in MenuBoard. */
  hero_secondary_label: string | null;
  hero_secondary_href: string | null;
  /** Public “New products” carousel headings (after Coffee; DB section id remains `pastries`). */
  pastry_sec_the: string | null;
  pastry_sec_big_line1: string | null;
  pastry_sec_big_line2: string | null;
  pastry_sec_tag: string | null;
  updated_at?: string | null;
};

export type MenuDataMode = "live" | "fallback";
