import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HeroEditor } from "./HeroEditor";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: row } = await supabase
    .from("site_settings")
    .select(
      "hero_bg_image_url, hero_eyebrow, hero_brand_line1, hero_brand_line2, hero_subtitle, hero_tag1, hero_tag2, hero_tag3, hero_primary_label, hero_secondary_label, hero_secondary_href"
    )
    .eq("id", 1)
    .maybeSingle();

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
          Control the background image and every piece of text on the hero at the top of the public menu.
          Leave any field blank to keep the built-in default.
        </p>
      </div>

      <HeroEditor
        currentBgImageUrl={row?.hero_bg_image_url ?? null}
        currentEyebrow={row?.hero_eyebrow ?? null}
        currentBrandLine1={row?.hero_brand_line1 ?? null}
        currentBrandLine2={row?.hero_brand_line2 ?? null}
        currentSubtitle={row?.hero_subtitle ?? null}
        currentTag1={row?.hero_tag1 ?? null}
        currentTag2={row?.hero_tag2 ?? null}
        currentTag3={row?.hero_tag3 ?? null}
        currentPrimaryLabel={row?.hero_primary_label ?? null}
        currentSecondaryLabel={row?.hero_secondary_label ?? null}
        currentSecondaryHref={row?.hero_secondary_href ?? null}
      />
    </div>
  );
}
