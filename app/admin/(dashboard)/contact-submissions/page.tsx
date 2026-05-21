import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContactSubmissionsBoard } from "@/components/admin/ContactSubmissionsBoard";
import { createClient } from "@/lib/supabase/server";
import type { ContactSubmissionRow } from "@/types/contact-submission";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContactSubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: rows, error } = await supabase
    .from("contact_submissions")
    .select("id, name, email, subject, phone, country, message, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const submissions = (rows ?? []) as ContactSubmissionRow[];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Contact submissions" }]}
        title="Contact submissions"
        description="Messages sent from the public menu footer. Review details here and follow up by email or phone outside this console."
      />

      {error && (
        <div className="admin-message admin-message--warning">
          <p className="admin-message-title">Could not load submissions</p>
          <p style={{ margin: 0 }}>
            If this table is new, run the migration{" "}
            <code className="admin-code">20260501000000_contact_submissions.sql</code> in Supabase. ({error.message})
          </p>
        </div>
      )}

      {!error && submissions.length === 0 && (
        <div className="admin-card admin-card-padded" style={{ textAlign: "center" }}>
          <p className="admin-section-title">No submissions yet</p>
          <p className="admin-page-desc" style={{ marginTop: 8, marginLeft: "auto", marginRight: "auto" }}>
            When customers use Contact us on the public menu, entries appear here.
          </p>
        </div>
      )}

      {!error && submissions.length > 0 && <ContactSubmissionsBoard submissions={submissions} />}
    </div>
  );
}
