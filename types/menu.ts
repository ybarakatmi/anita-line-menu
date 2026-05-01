export type MenuSection =
  | "seasonal"
  | "bestsellers"
  | "gelato"
  | "sorbet"
  | "coffee"
  | "drinks";

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
  /** Present when loaded from Supabase */
  created_at?: string;
  updated_at?: string;
};

export type SiteSettingsRow = {
  id: number;
  ticker_segments: string[];
  seasonal_tagline: string | null;
  hero_eyebrow: string | null;
  updated_at?: string | null;
};

export type MenuDataMode = "live" | "fallback";
