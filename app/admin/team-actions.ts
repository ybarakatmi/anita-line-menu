"use server";

import { fetchConsoleAccess } from "@/lib/console-access";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TeamMemberPermissions = {
  can_edit_products: boolean;
  can_edit_sections: boolean;
  can_view_inquiries: boolean;
  can_submit_tickets: boolean;
};

export type TeamMember = {
  user_id: string;
  email: string;
  display_name: string | null;
  role: string;
  can_edit_products: boolean;
  can_edit_sections: boolean;
  can_view_inquiries: boolean;
  can_submit_tickets: boolean;
  created_at: string;
};

async function requireOwnerClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  const access = await fetchConsoleAccess(supabase, user.id);
  if (!access?.canManageTeam) throw new Error("Only the owner can manage team members.");
  return supabase;
}

export async function listTeamMembersAction(): Promise<TeamMember[]> {
  const supabase = await requireOwnerClient();
  const { data, error } = await supabase
    .from("console_profiles")
    .select(
      "user_id, email, display_name, role, can_edit_products, can_edit_sections, can_view_inquiries, can_submit_tickets, created_at"
    )
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMember[];
}

export async function createTeamMemberAction(input: {
  email: string;
  password: string;
  display_name: string;
  permissions: TeamMemberPermissions;
}) {
  await requireOwnerClient();

  const admin = createServiceRoleClient();
  if (!admin) throw new Error("Service role key is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your environment.");

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    email_confirm: true,
  });
  if (createErr) throw new Error(createErr.message);
  if (!created.user) throw new Error("User creation failed.");

  const { error: profileErr } = await admin
    .from("console_profiles")
    .insert({
      user_id: created.user.id,
      email: input.email.trim().toLowerCase(),
      display_name: input.display_name.trim() || null,
      role: "viewer",
      ...input.permissions,
    });

  if (profileErr) {
    // Roll back the auth user so we don't leave orphaned accounts.
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(profileErr.message);
  }

  revalidatePath("/admin/settings", "page");
  return { ok: true as const, userId: created.user.id };
}

export async function updateTeamMemberAction(input: {
  userId: string;
  display_name: string;
  permissions: TeamMemberPermissions;
}) {
  await requireOwnerClient();

  const admin = createServiceRoleClient();
  if (!admin) throw new Error("Service role key is not configured.");

  const { error } = await admin
    .from("console_profiles")
    .update({
      display_name: input.display_name.trim() || null,
      ...input.permissions,
    })
    .eq("user_id", input.userId)
    .neq("role", "owner"); // Safety: never downgrade the owner row.

  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings", "page");
  return { ok: true as const };
}

export async function removeTeamMemberAction(input: { userId: string }) {
  await requireOwnerClient();

  const admin = createServiceRoleClient();
  if (!admin) throw new Error("Service role key is not configured.");

  // Confirm target is not an owner before deleting.
  const { data: profile } = await admin
    .from("console_profiles")
    .select("role")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (profile?.role === "owner") throw new Error("Cannot remove the owner account.");

  await admin.from("console_profiles").delete().eq("user_id", input.userId);
  await admin.auth.admin.deleteUser(input.userId);

  revalidatePath("/admin/settings", "page");
  return { ok: true as const };
}
