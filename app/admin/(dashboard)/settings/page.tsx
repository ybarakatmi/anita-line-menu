import { AccountForm } from "@/components/admin/AccountForm";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { SupportTicketForm } from "@/components/admin/SupportTicketForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="space-y-10">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <AdminBreadcrumbs items={[{ label: "Overview", href: "/admin" }, { label: "Settings" }]} />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Account &amp; support</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Manage your sign-in details or send us a ticket if something isn&apos;t working right.
        </p>
      </div>

      <AccountForm currentEmail={user.email ?? ""} />
      <SupportTicketForm />
    </div>
  );
}
