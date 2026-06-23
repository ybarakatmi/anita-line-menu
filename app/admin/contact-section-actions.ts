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

export async function saveContactSectionImageAction(input: {
  footer_contact_image_url: string | null;
}) {
  const supabase = await requireEditorClient();

  const url = input.footer_contact_image_url?.trim() || null;

  const { error } = await supabase
    .from("site_settings")
    .update({ footer_contact_image_url: url })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/contact-section", "page");
  return { ok: true as const };
}

export async function clearContactSectionImageAction() {
  const supabase = await requireEditorClient();

  const { error } = await supabase
    .from("site_settings")
    .update({ footer_contact_image_url: null })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/contact-section", "page");
  return { ok: true as const };
}
