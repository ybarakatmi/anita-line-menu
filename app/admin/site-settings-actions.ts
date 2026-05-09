"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const MAX_MEDIA_URL_LEN = 4096;

function trimOrNull(v: string | null | undefined) {
  if (v == null) return null;
  const t = typeof v === "string" ? v.trim() : String(v).trim();
  if (!t) return null;
  return t.length > MAX_MEDIA_URL_LEN ? t.slice(0, MAX_MEDIA_URL_LEN) : t;
}

export async function saveSiteMediaSettingsAction(input: {
  hero_eyebrow: string | null;
  hero_secondary_label: string | null;
  hero_secondary_href: string | null;
  hero_video_url: string | null;
  hero_video_poster_url: string | null;
  separator_video_url: string | null;
  pastry_sec_the: string | null;
  pastry_sec_big_line1: string | null;
  pastry_sec_big_line2: string | null;
  pastry_sec_tag: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      hero_eyebrow: trimOrNull(input.hero_eyebrow),
      hero_secondary_label: trimOrNull(input.hero_secondary_label),
      hero_secondary_href: trimOrNull(input.hero_secondary_href),
      hero_video_url: trimOrNull(input.hero_video_url),
      hero_video_poster_url: trimOrNull(input.hero_video_poster_url),
      separator_video_url: trimOrNull(input.separator_video_url),
      pastry_sec_the: trimOrNull(input.pastry_sec_the),
      pastry_sec_big_line1: trimOrNull(input.pastry_sec_big_line1),
      pastry_sec_big_line2: trimOrNull(input.pastry_sec_big_line2),
      pastry_sec_tag: trimOrNull(input.pastry_sec_tag),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select("id");

  if (error) {
    const msg = error.message || "Update failed";
    if (/permission denied|row-level security|RLS/i.test(msg)) {
      throw new Error(
        "Supabase blocked this update (row-level security). Sign in as a workspace owner, or apply the site_settings policy your project expects."
      );
    }
    throw new Error(msg);
  }
  if (!data?.length) {
    throw new Error(
      "No row was updated. Check that public.site_settings has id = 1, and that your account is allowed to update it."
    );
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings", "page");
  return { ok: true as const };
}
