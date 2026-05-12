import type { SupabaseClient } from "@supabase/supabase-js";

export type ConsoleRole = "owner" | "manager" | "viewer";

export type ConsoleAccess = {
  role: ConsoleRole;
  canEditMenu: boolean;
  canManageTeam: boolean;
};

/**
 * Reads the authenticated user's role from console_profiles.
 * Falls back to "owner" if the table is missing or the row doesn't exist yet —
 * this keeps the console accessible for the primary account even when the
 * console_profiles migration hasn't been applied to the Supabase project.
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

  // If the table doesn't exist, the query errors, or there's simply no row yet,
  // fall back to full owner access so the primary account is never locked out.
  const role: ConsoleRole = (data?.role as ConsoleRole) ?? "owner";

  if (error) {
    // Only log non-RLS errors (42P01 = table does not exist)
    const pg = (error as { code?: string }).code;
    if (pg !== "42P01" && pg !== "PGRST116") {
      console.warn("[console-access] fetchConsoleAccess:", error.message);
    }
  }

  return {
    role,
    canEditMenu: role === "owner" || role === "manager",
    canManageTeam: role === "owner",
  };
}
