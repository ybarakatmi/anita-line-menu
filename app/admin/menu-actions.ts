"use server";

import { fetchConsoleAccess } from "@/lib/console-access";
import { createClient } from "@/lib/supabase/server";
import { isMenuSection, adminSectionHref } from "@/lib/admin-sections";
import type { MenuItemRow, MenuPriceTier, MenuSection } from "@/types/menu";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/admin")) return "/admin";
  return value;
}

function parseTags(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function revalidateMenuSurfaces(section: MenuSection) {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath(adminSectionHref(section), "page");
}

async function requireMenuEditorClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const access = await fetchConsoleAccess(supabase, user.id);
  if (!access?.canEditMenu) {
    throw new Error("Your role can view the catalog but not edit it.");
  }
  return supabase;
}

async function getMenuEditorClientOrRedirect(redirectPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const access = await fetchConsoleAccess(supabase, user.id);
  if (!access?.canEditMenu) redirect(redirectPath);
  return supabase;
}

export async function saveMenuItemAction(input: {
  id?: string | null;
  section: MenuSection;
  name: string;
  description: string | null;
  price_display: string | null;
  emoji: string | null;
  image_url: string | null;
  tagsRaw: string;
  badge: string | null;
  is_new: boolean;
  is_fave: boolean;
  is_vegan: boolean;
  is_active: boolean;
  sort_order: number;
  promo_label: string | null;
  seasonal_ribbon_label: string | null;
  /** Null = public menu uses automatic tiers for this section. */
  price_tiers: MenuPriceTier[] | null;
}) {
  const supabase = await requireMenuEditorClient();
  const tags = parseTags(input.tagsRaw);

  const payload = {
    section: input.section,
    name: input.name,
    description: input.description,
    price_display: input.price_display,
    emoji: input.emoji,
    image_url: input.image_url,
    tags,
    badge: input.badge,
    is_new: input.is_new,
    is_fave: input.is_fave,
    is_vegan: input.is_vegan,
    is_active: input.is_active,
    sort_order: input.sort_order,
    promo_label: input.promo_label,
    seasonal_ribbon_label: input.seasonal_ribbon_label,
    price_tiers: input.price_tiers,
  };

  if (!input.id) {
    const { error } = await supabase.from("menu_items").insert(payload);
    if (error) throw new Error(error.message);
    revalidateMenuSurfaces(input.section);
    return { ok: true as const, mode: "insert" as const };
  }

  const { error } = await supabase.from("menu_items").update(payload).eq("id", input.id);
  if (error) throw new Error(error.message);
  revalidateMenuSurfaces(input.section);
  return { ok: true as const, mode: "update" as const };
}

export async function deleteMenuItemAction(input: { id: string; section: MenuSection }) {
  const supabase = await requireMenuEditorClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", input.id);
  if (error) throw new Error(error.message);
  revalidateMenuSurfaces(input.section);
  return { ok: true as const };
}

export async function reorderMenuItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? ""));
  const sectionHint = String(formData.get("section") ?? "");
  const section: MenuSection | null = isMenuSection(sectionHint) ? sectionHint : null;

  if (!id || (direction !== "up" && direction !== "down")) return;

  const supabase = await getMenuEditorClientOrRedirect(returnTo);
  const { data: current } = await supabase
    .from("menu_items")
    .select("id, section, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (!current) return;

  const neighborQuery = supabase
    .from("menu_items")
    .select("id, sort_order")
    .eq("section", current.section);
  const { data: neighbor } =
    direction === "up"
      ? await neighborQuery
          .lt("sort_order", current.sort_order)
          .order("sort_order", { ascending: false })
          .limit(1)
          .maybeSingle()
      : await neighborQuery
          .gt("sort_order", current.sort_order)
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle();

  if (!neighbor) return;

  await supabase.from("menu_items").update({ sort_order: neighbor.sort_order }).eq("id", current.id);
  await supabase.from("menu_items").update({ sort_order: current.sort_order }).eq("id", neighbor.id);

  revalidatePath("/admin", "layout");
  redirect(section ? adminSectionHref(section) : returnTo);
}

export async function duplicateMenuItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? ""));
  const sectionHint = String(formData.get("section") ?? "");
  const section: MenuSection | null = isMenuSection(sectionHint) ? sectionHint : null;
  if (!id) return;

  const supabase = await getMenuEditorClientOrRedirect(returnTo);
  const { data: source } = await supabase.from("menu_items").select("*").eq("id", id).maybeSingle();
  if (!source) return;

  const { data: maxRow } = await supabase
    .from("menu_items")
    .select("sort_order")
    .eq("section", source.section)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = source as MenuItemRow;
  const {
    id: _existingId,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...rest
  } = row as MenuItemRow & { created_at?: string; updated_at?: string };
  void _existingId;
  void _createdAt;
  void _updatedAt;

  await supabase.from("menu_items").insert({
    ...rest,
    name: `${row.name} (Copy)`,
    sort_order: (maxRow?.sort_order ?? row.sort_order ?? 0) + 1,
  });

  revalidatePath("/admin", "layout");
  redirect(section ? adminSectionHref(section) : returnTo);
}
