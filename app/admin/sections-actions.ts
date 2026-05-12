"use server";

import { fetchConsoleAccess } from "@/lib/console-access";
import { createClient } from "@/lib/supabase/server";
import type { SectionLabelOverride } from "@/types/menu";
import { revalidatePath } from "next/cache";

async function requireEditorClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const access = await fetchConsoleAccess(supabase, user.id);
  if (!access?.canEditMenu) throw new Error("Your role cannot edit site settings.");
  return supabase;
}

export async function saveSectionLabelsAction(
  labels: Record<string, SectionLabelOverride>
) {
  const supabase = await requireEditorClient();

  // Strip empty strings so we only store real overrides.
  const cleaned: Record<string, SectionLabelOverride> = {};
  for (const [section, entry] of Object.entries(labels)) {
    const c: SectionLabelOverride = {};
    for (const field of ["the", "big_line1", "big_line2", "tag"] as const) {
      const v = entry[field]?.trim();
      if (v) c[field] = v;
    }
    if (Object.keys(c).length) cleaned[section] = c;
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ section_labels: cleaned })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/sections", "page");
  return { ok: true as const };
}
