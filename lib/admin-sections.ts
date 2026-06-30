import { FALLBACK_MENU_SECTIONS, fetchMenuSections } from "@/lib/menu-sections";
import type { MenuSectionRow } from "@/types/menu";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminSectionMeta = {
  id: string;
  label: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
  layout: MenuSectionRow["layout"];
};

function toAdminMeta(row: MenuSectionRow): AdminSectionMeta {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    sort_order: row.sort_order,
    is_active: row.is_active,
    is_system: row.is_system,
    layout: row.layout,
  };
}

/** Static fallback for offline / missing table — mirrors seeded built-ins. */
export const ADMIN_MENU_SECTIONS: AdminSectionMeta[] = FALLBACK_MENU_SECTIONS.map(toAdminMeta);

export async function getAdminMenuSections(supabase: SupabaseClient): Promise<AdminSectionMeta[]> {
  const rows = await fetchMenuSections(supabase);
  return rows.map(toAdminMeta);
}

export function isMenuSection(value: string, sections: AdminSectionMeta[] = ADMIN_MENU_SECTIONS): boolean {
  return sections.some((s) => s.id === value);
}

export function adminSectionHref(section: string) {
  return `/admin/menu/${section}`;
}

export function getSectionMeta(
  section: string,
  sections: AdminSectionMeta[] = ADMIN_MENU_SECTIONS
): AdminSectionMeta {
  const meta = sections.find((s) => s.id === section);
  if (!meta) {
    return {
      id: section,
      label: section,
      description: "Menu items for this category.",
      sort_order: 999,
      is_active: true,
      is_system: false,
      layout: "carousel",
    };
  }
  return meta;
}
