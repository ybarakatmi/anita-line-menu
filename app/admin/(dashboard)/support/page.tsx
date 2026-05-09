import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
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
    <div className="space-y-10">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <AdminBreadcrumbs items={[{ label: "Overview", href: "/admin" }, { label: "Support" }]} />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Help</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Submit a ticket</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Found a bug or need help with the menu console? Send a note and we&apos;ll follow up by email.
        </p>
      </div>

      <SupportTicketForm />
    </div>
  );
}
