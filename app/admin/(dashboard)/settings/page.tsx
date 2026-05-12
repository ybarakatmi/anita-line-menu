import { AccountForm } from "@/components/admin/AccountForm";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { TeamManager } from "@/components/admin/TeamManager";
import { listTeamMembersAction } from "@/app/admin/team-actions";
import { fetchConsoleAccess } from "@/lib/console-access";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const access = await fetchConsoleAccess(supabase, user.id);
  const isOwner = access?.canManageTeam ?? false;

  const members = isOwner ? await listTeamMembersAction().catch(() => []) : [];

  return (
    <div className="space-y-10">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <AdminBreadcrumbs items={[{ label: "Overview", href: "/admin" }, { label: "Settings" }]} />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Account</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
      </div>

      <AccountForm currentEmail={user.email ?? ""} />

      {isOwner && (
        <div className="space-y-4 border-t border-slate-200 pt-8">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Team</p>
            <p className="text-sm text-slate-600">
              Create staff accounts and control exactly what each person can do.
              Guest accounts can never add or remove other users.
            </p>
          </div>
          <TeamManager initialMembers={members} />
        </div>
      )}
    </div>
  );
}
