import type { SupabaseClient } from "@supabase/supabase-js";

export type ConsoleRole = "owner" | "manager" | "viewer";

export type ConsoleAccess = {
  role: ConsoleRole;
  canEditMenu: boolean;
  canManageTeam: boolean;
};

/**
 * Workspace roles / console_profiles gating is disabled: any authenticated user
 * is treated as a full owner for the menu console UI.
 */
export async function fetchConsoleAccess(
  _supabase: SupabaseClient,
  userId: string
): Promise<ConsoleAccess | null> {
  if (!userId) return null;
  return {
    role: "owner",
    canEditMenu: true,
    canManageTeam: true,
  };
}
