import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ContactSectionEditor } from "./ContactSectionEditor";

export const dynamic = "force-dynamic";

export default async function AdminContactSectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: row } = await supabase
    .from("site_settings")
    .select("footer_contact_image_url")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="admin-stack">
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Contact section" }]}
        eyebrow="Presentation"
        title="Contact section"
        description="Manage the photo shown below the SEND button in the CONTACT US footer at the bottom of the public menu."
      />

      <ContactSectionEditor currentImageUrl={row?.footer_contact_image_url ?? null} />
    </div>
  );
}
