import type { MenuSectionRow, SectionLabelOverride, SiteSettingsRow } from "@/types/menu";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

const SECTION_ID_PATTERN = /^[a-z][a-z0-9-]{1,48}$/;

/** Fallback when `menu_sections` table is missing or empty. */
export const FALLBACK_MENU_SECTIONS: MenuSectionRow[] = [
  {
    id: "seasonal",
    label: "Seasonal",
    description: "Rotating and limited-time offerings shown in the seasonal strip.",
    sort_order: 10,
    is_active: true,
    is_system: true,
    layout: "system",
    heading_the: "Right Now",
    heading_big_line1: "New &",
    heading_big_line2: "Seasonal",
    heading_tag: "Spring 2026 Arrivals",
  },
  {
    id: "bestsellers",
    label: "Best sellers",
    description: "Hero carousel — your highest-velocity flavors and combos.",
    sort_order: 20,
    is_active: true,
    is_system: true,
    layout: "system",
    heading_the: "Customer Favorites",
    heading_big_line1: "Best",
    heading_big_line2: "Sellers",
    heading_tag: "Most loved scoops",
  },
  {
    id: "coffee",
    label: "Coffee",
    description: "Espresso bar items; emoji displays on the public menu cards.",
    sort_order: 30,
    is_active: true,
    is_system: true,
    layout: "system",
    heading_the: "Imported from Italy",
    heading_big_line1: "Italian",
    heading_big_line2: "Coffee",
    heading_tag: "Beans Flown in from Italy",
  },
  {
    id: "pastries",
    label: "New products",
    description: "Pastries and rotating specials — carousel after Coffee.",
    sort_order: 40,
    is_active: true,
    is_system: true,
    layout: "system",
    heading_the: "Just in",
    heading_big_line1: "New",
    heading_big_line2: "Products",
    heading_tag: "Pastries · Baked goods · Rotating picks",
  },
  {
    id: "drinks",
    label: "Drinks",
    description: "Beverages and add-ons in the drinks section.",
    sort_order: 50,
    is_active: true,
    is_system: true,
    layout: "system",
    heading_the: "Also Available",
    heading_big_line1: "Drinks",
    heading_big_line2: "& More",
    heading_tag: "Sparkling · Sodas · Water",
  },
  {
    id: "yogurt",
    label: "Yogurt",
    description: "Frozen yogurt flavors on the public menu.",
    sort_order: 60,
    is_active: true,
    is_system: true,
    layout: "system",
    heading_the: "Swirled Fresh",
    heading_big_line1: "Frozen",
    heading_big_line2: "Yogurt",
    heading_tag: "Tart & soft serve",
  },
  {
    id: "gelato",
    label: "Gelato",
    description: "Cream gelato grid and carousel; filters use tags on each item.",
    sort_order: 70,
    is_active: true,
    is_system: true,
    layout: "system",
    heading_the: "Handcrafted Daily",
    heading_big_line1: "Cream",
    heading_big_line2: "Gelato",
    heading_tag: "32 Flavors · No Artificial Colors",
  },
  {
    id: "sorbet",
    label: "Sorbet",
    description: "Plant-based and sorbet lineup; vegan flag drives badges.",
    sort_order: 80,
    is_active: true,
    is_system: true,
    layout: "system",
    heading_the: "Dairy-Free",
    heading_big_line1: "Sorbets",
    heading_big_line2: "& Vegan",
    heading_tag: "100% Plant-Based",
  },
];

export function slugifySectionId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 49);
}

export function isValidSectionId(id: string): boolean {
  return SECTION_ID_PATTERN.test(id);
}

export function sortMenuSections(sections: MenuSectionRow[]): MenuSectionRow[] {
  return [...sections].sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label));
}

export function sectionSortIndex(sections: MenuSectionRow[], sectionId: string): number {
  const ordered = sortMenuSections(sections);
  const idx = ordered.findIndex((s) => s.id === sectionId);
  return idx >= 0 ? idx : 999;
}

export function defaultNavLabel(section: MenuSectionRow): string {
  const line1 = section.heading_big_line1?.trim();
  const line2 = section.heading_big_line2?.trim();
  if (line1 || line2) return [line1, line2].filter(Boolean).join(" ");
  return section.label;
}

export function getSectionHeadingField(
  section: MenuSectionRow,
  settings: SiteSettingsRow | null | undefined,
  field: keyof SectionLabelOverride,
  fallback = ""
): string {
  const override = settings?.section_labels?.[section.id]?.[field]?.trim();
  if (override) return override;

  const fromRow =
    field === "the"
      ? section.heading_the
      : field === "big_line1"
        ? section.heading_big_line1
        : field === "big_line2"
          ? section.heading_big_line2
          : section.heading_tag;
  return fromRow?.trim() || fallback;
}

async function loadMenuSections(supabase: SupabaseClient): Promise<MenuSectionRow[]> {
  const { data, error } = await supabase
    .from("menu_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    const pg = (error as { code?: string }).code;
    if (pg !== "42P01" && pg !== "PGRST116") {
      console.warn("[menu-sections] fetchMenuSections:", error.message);
    }
    return FALLBACK_MENU_SECTIONS;
  }

  if (!data?.length) return FALLBACK_MENU_SECTIONS;
  return data as MenuSectionRow[];
}

export const fetchMenuSections = cache(loadMenuSections);

export async function sectionExists(supabase: SupabaseClient, sectionId: string): Promise<boolean> {
  const sections = await fetchMenuSections(supabase);
  return sections.some((s) => s.id === sectionId);
}

export async function getSectionById(
  supabase: SupabaseClient,
  sectionId: string
): Promise<MenuSectionRow | null> {
  const sections = await fetchMenuSections(supabase);
  return sections.find((s) => s.id === sectionId) ?? null;
}
