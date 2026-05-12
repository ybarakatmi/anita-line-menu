import type { SupabaseClient } from "@supabase/supabase-js";

export type ConsoleRole = "owner" | "manager" | "viewer";

export type ConsoleAccess = {
  role: ConsoleRole;
  canEditMenu: boolean;
  canManageTeam: boolean;
};

/**
 * Reads the authenticated user's role from console_profiles.
 * First account ever created is auto-assigned "owner" by DB trigger.
 * Returns null if the user has no profile (should not happen in practice).
 */
export async function fetchConsoleAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<ConsoleAccess | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("console_profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const role = data.role as ConsoleRole;
  return {
    role,
    canEditMenu: role === "owner" || role === "manager",
    canManageTeam: role === "owner",
  };
}
