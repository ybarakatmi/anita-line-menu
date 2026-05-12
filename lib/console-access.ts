import type { SupabaseClient } from "@supabase/supabase-js";

export type ConsoleRole = "owner" | "manager" | "viewer";

export type ConsoleAccess = {
  role: ConsoleRole;
  /** Can create / edit / delete menu items and section headings. */
  canEditMenu: boolean;
  /** Can edit menu items (products). */
  canEditProducts: boolean;
  /** Can edit section headings, hero, and presentation settings. */
  canEditSections: boolean;
  /** Can view contact-form inquiries. */
  canViewInquiries: boolean;
  /** Can submit support tickets. */
  canSubmitTickets: boolean;
  /** Can add / remove team members (owner only). */
  canManageTeam: boolean;
};

/**
 * Reads the authenticated user's role and granular permissions from console_profiles.
 * Falls back to full owner access if the table / row is missing so the primary
 * account is never locked out.
 */
export async function fetchConsoleAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<ConsoleAccess | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("console_profiles")
    .select(
      "role, can_edit_products, can_edit_sections, can_view_inquiries, can_submit_tickets"
    )
    .eq("user_id", userId)
    .maybeSingle();

  const role: ConsoleRole = (data?.role as ConsoleRole) ?? "owner";
  const isOwner = role === "owner";

  if (error) {
    const pg = (error as { code?: string }).code;
    if (pg !== "42P01" && pg !== "PGRST116") {
      console.warn("[console-access] fetchConsoleAccess:", error.message);
    }
  }

  // Owners always get full access regardless of stored booleans.
  if (isOwner || !data) {
    return {
      role,
      canEditMenu: true,
      canEditProducts: true,
      canEditSections: true,
      canViewInquiries: true,
      canSubmitTickets: true,
      canManageTeam: true,
    };
  }

  const canEditProducts = Boolean(data.can_edit_products);
  const canEditSections = Boolean(data.can_edit_sections);

  return {
    role,
    canEditMenu: canEditProducts || canEditSections,
    canEditProducts,
    canEditSections,
    canViewInquiries: Boolean(data.can_view_inquiries),
    canSubmitTickets: Boolean(data.can_submit_tickets),
    canManageTeam: false,
  };
}
