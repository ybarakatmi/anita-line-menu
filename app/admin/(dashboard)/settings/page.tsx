import { AccountForm } from "@/components/admin/AccountForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
    <div className="admin-stack">
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Settings" }]}
        eyebrow="Configuration"
        title="Settings"
        description="Manage your account and, if you are an owner, team access for the menu console."
      />

      <AccountForm currentEmail={user.email ?? ""} />

      {isOwner && (
        <div className="admin-divider-section admin-stack-sm">
          <div>
            <p className="admin-eyebrow">Team</p>
            <p className="admin-page-desc" style={{ marginTop: 6 }}>
              Create staff accounts and control exactly what each person can do. Guest accounts can never add or remove
              other users.
            </p>
          </div>
          <TeamManager initialMembers={members} />
        </div>
      )}
    </div>
  );
}
