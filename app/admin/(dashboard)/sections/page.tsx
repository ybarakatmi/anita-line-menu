import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
    <div className="admin-stack">
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Section headings" }]}
        eyebrow="Presentation"
        title="Section headings"
        description="Customise the eyebrow, heading, and tag line for each section on the public menu. Leave any field blank to keep the built-in default."
      />

      <SectionsEditor savedLabels={savedLabels} />
    </div>
  );
}
