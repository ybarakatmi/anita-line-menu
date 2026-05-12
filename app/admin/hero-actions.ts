"use server";

import { fetchConsoleAccess } from "@/lib/console-access";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireOwnerClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const access = await fetchConsoleAccess(supabase, user.id);
  if (!access?.canEditMenu) {
    throw new Error("Your role cannot edit site settings.");
  }
  return supabase;
}

export async function saveHeroSettingsAction(input: {
  hero_bg_image_url: string | null;
  hero_eyebrow: string | null;
  hero_secondary_label: string | null;
  hero_secondary_href: string | null;
}) {
  const supabase = await requireOwnerClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      hero_bg_image_url: input.hero_bg_image_url || null,
      hero_eyebrow: input.hero_eyebrow || null,
      hero_secondary_label: input.hero_secondary_label || null,
      hero_secondary_href: input.hero_secondary_href || null,
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/hero", "page");
  return { ok: true as const };
}

export async function clearHeroBgImageAction() {
  const supabase = await requireOwnerClient();

  const { error } = await supabase
    .from("site_settings")
    .update({ hero_bg_image_url: null })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/hero", "page");
  return { ok: true as const };
}
