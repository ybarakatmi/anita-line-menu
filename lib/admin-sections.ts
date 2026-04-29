import type { MenuSection } from "@/types/menu";

export type AdminSectionMeta = {
  id: MenuSection;
  label: string;
  description: string;
};

/** Navigation order and copy for the admin console (franchise / multi-store tone). */
export const ADMIN_MENU_SECTIONS: AdminSectionMeta[] = [
  {
    id: "seasonal",
    label: "Seasonal",
    description: "Rotating and limited-time offerings shown in the seasonal strip.",
  },
  {
    id: "bestsellers",
    label: "Best sellers",
    description: "Hero carousel — your highest-velocity flavors and combos.",
  },
  {
    id: "gelato",
    label: "Gelato",
    description: "Cream gelato grid and carousel; filters use tags on each item.",
  },
  {
    id: "sorbet",
    label: "Sorbet",
    description: "Plant-based and sorbet lineup; vegan flag drives badges.",
  },
  {
    id: "coffee",
    label: "Coffee",
    description: "Espresso bar items; emoji displays on the public menu cards.",
  },
  {
    id: "drinks",
    label: "Drinks",
    description: "Beverages and add-ons in the drinks section.",
  },
];

export function isMenuSection(value: string): value is MenuSection {
  return ADMIN_MENU_SECTIONS.some((s) => s.id === value);
}

export function adminSectionHref(section: MenuSection) {
  return `/admin/menu/${section}`;
}

export function getSectionMeta(section: MenuSection): AdminSectionMeta {
  const meta = ADMIN_MENU_SECTIONS.find((s) => s.id === section);
  if (!meta) {
    return {
      id: section,
      label: section,
      description: "Menu items for this category.",
    };
  }
  return meta;
}
