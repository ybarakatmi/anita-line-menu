import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { createClient } from "@/lib/supabase/server";
import type { SectionLabelOverride } from "@/types/menu";
import { redirect } from "next/navigation";
import { SectionsEditor } from "./SectionsEditor";

export const dynamic = "force-dynamic";

export default async function AdminSectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: row } = await supabase
    .from("site_settings")
    .select("section_labels")
    .eq("id", 1)
    .maybeSingle();

  const savedLabels =
    (row?.section_labels as Record<string, SectionLabelOverride> | null) ?? null;

  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <AdminBreadcrumbs
          items={[{ label: "Overview", href: "/admin" }, { label: "Sections" }]}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Presentation
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Section headings
        </h1>
        <p className="text-sm text-slate-500">
          Customise the eyebrow, heading, and tag line for each section on the public menu.
          Leave any field blank to keep the built-in default.
        </p>
      </div>

      <SectionsEditor savedLabels={savedLabels} />
    </div>
  );
}
