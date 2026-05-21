import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SupportTicketForm } from "@/components/admin/SupportTicketForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="admin-stack">
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Support" }]}
        eyebrow="Help"
        title="Submit a ticket"
        description="Found a bug or need help with the menu console? Send a note and we'll follow up by email."
      />

      <SupportTicketForm />
    </div>
  );
}
