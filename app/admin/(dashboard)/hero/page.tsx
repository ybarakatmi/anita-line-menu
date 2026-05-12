import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettingsRow } from "@/types/menu";
import { redirect } from "next/navigation";
import { HeroEditor } from "./HeroEditor";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: settingsRow } = await supabase
    .from("site_settings")
    .select(
      "hero_bg_image_url, hero_eyebrow, hero_secondary_label, hero_secondary_href"
    )
    .eq("id", 1)
    .maybeSingle();

  const settings = settingsRow as Pick<
    SiteSettingsRow,
    "hero_bg_image_url" | "hero_eyebrow" | "hero_secondary_label" | "hero_secondary_href"
  > | null;

  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <AdminBreadcrumbs
          items={[{ label: "Overview", href: "/admin" }, { label: "Hero" }]}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Presentation
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Hero section</h1>
        <p className="text-sm text-slate-500">
          Control the full-bleed background image and headline copy shown at the top of the public
          menu.
        </p>
      </div>

      <HeroEditor
        currentBgImageUrl={settings?.hero_bg_image_url ?? null}
        currentEyebrow={settings?.hero_eyebrow ?? null}
        currentSecondaryLabel={settings?.hero_secondary_label ?? null}
        currentSecondaryHref={settings?.hero_secondary_href ?? null}
      />
    </div>
  );
}
