"use server";

import { fetchConsoleAccess } from "@/lib/console-access";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireEditorClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const access = await fetchConsoleAccess(supabase, user.id);
  if (!access?.canEditSections) {
    throw new Error("Your role cannot edit site settings.");
  }
  return supabase;
}

export async function saveHeroSettingsAction(input: {
  hero_bg_image_url: string | null;
  hero_eyebrow: string | null;
  hero_brand_line1: string | null;
  hero_brand_line2: string | null;
  hero_subtitle: string | null;
  hero_tag1: string | null;
  hero_tag2: string | null;
  hero_tag3: string | null;
  hero_primary_label: string | null;
  hero_secondary_label: string | null;
  hero_secondary_href: string | null;
}) {
  const supabase = await requireEditorClient();

  const n = (v: string | null) => v?.trim() || null;

  const { error } = await supabase
    .from("site_settings")
    .update({
      hero_bg_image_url: n(input.hero_bg_image_url),
      hero_eyebrow: n(input.hero_eyebrow),
      hero_brand_line1: n(input.hero_brand_line1),
      hero_brand_line2: n(input.hero_brand_line2),
      hero_subtitle: n(input.hero_subtitle),
      hero_tag1: n(input.hero_tag1),
      hero_tag2: n(input.hero_tag2),
      hero_tag3: n(input.hero_tag3),
      hero_primary_label: n(input.hero_primary_label),
      hero_secondary_label: n(input.hero_secondary_label),
      hero_secondary_href: n(input.hero_secondary_href),
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/hero", "page");
  return { ok: true as const };
}

export async function clearHeroBgImageAction() {
  const supabase = await requireEditorClient();

  const { error } = await supabase
    .from("site_settings")
    .update({ hero_bg_image_url: null })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/hero", "page");
  return { ok: true as const };
}
