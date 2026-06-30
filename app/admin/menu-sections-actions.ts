"use server";

import { adminSectionHref } from "@/lib/admin-sections";
import { fetchConsoleAccess } from "@/lib/console-access";
import {
  fetchMenuSections,
  isValidSectionId,
  slugifySectionId,
  sortMenuSections,
} from "@/lib/menu-sections";
import { createClient } from "@/lib/supabase/server";
import type { MenuSectionLayout } from "@/types/menu";
import { revalidatePath } from "next/cache";

export type MenuSectionInput = {
  id?: string;
  label: string;
  description: string;
  layout: MenuSectionLayout;
  is_active: boolean;
  heading_the: string | null;
  heading_big_line1: string | null;
  heading_big_line2: string | null;
  heading_tag: string | null;
};

function revalidateSectionSurfaces(sectionId?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/menu-sections", "page");
  if (sectionId) {
    revalidatePath(adminSectionHref(sectionId), "page");
  }
}

async function requireSectionEditorClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const access = await fetchConsoleAccess(supabase, user.id);
  if (!access?.canEditSections) {
    throw new Error("Your role cannot manage menu sections.");
  }
  return supabase;
}

function cleanText(value: string | null | undefined): string | null {
  const s = (value ?? "").trim();
  return s ? s : null;
}

function nextSortOrder(sections: Awaited<ReturnType<typeof fetchMenuSections>>): number {
  const max = sections.reduce((m, s) => Math.max(m, s.sort_order), 0);
  return max + 10;
}

export async function createMenuSectionAction(input: MenuSectionInput) {
  const supabase = await requireSectionEditorClient();
  const label = input.label.trim();
  if (!label) throw new Error("Section name is required.");

  const id = slugifySectionId(input.id?.trim() || label);
  if (!isValidSectionId(id)) {
    throw new Error("Section id must be 2–49 lowercase letters, numbers, or hyphens.");
  }

  const sections = await fetchMenuSections(supabase);
  if (sections.some((s) => s.id === id)) {
    throw new Error(`A section with id "${id}" already exists.`);
  }

  if (input.layout === "system") {
    throw new Error("System layout is reserved for built-in sections.");
  }

  const { error } = await supabase.from("menu_sections").insert({
    id,
    label,
    description: input.description.trim(),
    sort_order: nextSortOrder(sections),
    is_active: input.is_active,
    is_system: false,
    layout: input.layout,
    heading_the: cleanText(input.heading_the),
    heading_big_line1: cleanText(input.heading_big_line1),
    heading_big_line2: cleanText(input.heading_big_line2),
    heading_tag: cleanText(input.heading_tag),
  });

  if (error) throw new Error(error.message);
  revalidateSectionSurfaces(id);
  return { ok: true as const, id };
}

export async function updateMenuSectionAction(input: MenuSectionInput & { id: string }) {
  const supabase = await requireSectionEditorClient();
  const id = input.id.trim();
  if (!id) throw new Error("Section id is required.");

  const sections = await fetchMenuSections(supabase);
  const existing = sections.find((s) => s.id === id);
  if (!existing) throw new Error("Section not found.");

  const label = input.label.trim();
  if (!label) throw new Error("Section name is required.");

  const layout = existing.is_system ? "system" : input.layout;
  if (!existing.is_system && layout === "system") {
    throw new Error("System layout is reserved for built-in sections.");
  }

  const { error } = await supabase
    .from("menu_sections")
    .update({
      label,
      description: input.description.trim(),
      is_active: input.is_active,
      layout,
      heading_the: cleanText(input.heading_the),
      heading_big_line1: cleanText(input.heading_big_line1),
      heading_big_line2: cleanText(input.heading_big_line2),
      heading_tag: cleanText(input.heading_tag),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateSectionSurfaces(id);
  return { ok: true as const };
}

export async function reorderMenuSectionAction(input: { id: string; direction: "up" | "down" }) {
  const supabase = await requireSectionEditorClient();
  const sections = sortMenuSections(await fetchMenuSections(supabase));
  const index = sections.findIndex((s) => s.id === input.id);
  if (index < 0) throw new Error("Section not found.");

  const swapIndex = input.direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= sections.length) return { ok: true as const };

  const current = sections[index];
  const neighbor = sections[swapIndex];
  const currentOrder = current.sort_order;
  const neighborOrder = neighbor.sort_order;

  const { error: e1 } = await supabase
    .from("menu_sections")
    .update({ sort_order: neighborOrder, updated_at: new Date().toISOString() })
    .eq("id", current.id);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from("menu_sections")
    .update({ sort_order: currentOrder, updated_at: new Date().toISOString() })
    .eq("id", neighbor.id);
  if (e2) throw new Error(e2.message);

  revalidateSectionSurfaces();
  return { ok: true as const };
}

export async function deleteMenuSectionAction(id: string) {
  const supabase = await requireSectionEditorClient();
  const trimmed = id.trim();
  if (!trimmed) throw new Error("Section id is required.");

  const sections = await fetchMenuSections(supabase);
  const existing = sections.find((s) => s.id === trimmed);
  if (!existing) throw new Error("Section not found.");
  if (existing.is_system) throw new Error("Built-in sections cannot be deleted.");

  const { count, error: countError } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("section", trimmed);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) {
    throw new Error("Remove or move all items in this section before deleting it.");
  }

  const { error } = await supabase.from("menu_sections").delete().eq("id", trimmed);
  if (error) throw new Error(error.message);

  revalidateSectionSurfaces(trimmed);
  return { ok: true as const };
}
