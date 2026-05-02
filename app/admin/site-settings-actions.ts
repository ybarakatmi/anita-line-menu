"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function trimOrNull(v: string | null | undefined) {
  const t = v?.trim();
  return t ? t : null;
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

  const { error } = await supabase
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
    .eq("id", 1);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings", "page");
  return { ok: true as const };
}
