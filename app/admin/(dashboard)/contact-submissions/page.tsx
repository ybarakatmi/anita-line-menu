import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
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
    <div className="space-y-8">
      <div className="space-y-2">
        <AdminBreadcrumbs items={[{ label: "Overview", href: "/admin" }, { label: "Contact submissions" }]} />
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Contact submissions</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Messages sent from the public menu footer. Review details here and follow up by email or phone outside this
          console.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-medium">Could not load submissions</p>
          <p className="mt-1 text-amber-800/90">
            If this table is new, run the migration{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">20260501000000_contact_submissions.sql</code> in
            Supabase. ({error.message})
          </p>
        </div>
      )}

      {!error && submissions.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-900">No submissions yet</p>
          <p className="mt-2 text-sm text-slate-600">
            When customers use <span className="font-medium">Contact us</span> on the public menu, entries appear here.
          </p>
        </div>
      )}

      {!error && submissions.length > 0 && <ContactSubmissionsBoard submissions={submissions} />}
    </div>
  );
}
