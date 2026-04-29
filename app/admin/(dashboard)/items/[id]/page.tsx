import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { adminSectionHref, getSectionMeta, isMenuSection } from "@/lib/admin-sections";
import { fetchConsoleAccess } from "@/lib/console-access";
import { createClient } from "@/lib/supabase/server";
import type { MenuItemRow, MenuSection } from "@/types/menu";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function safeReturnHref(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("/admin")) return decoded;
  } catch {
    /* ignore malformed returnTo */
  }
  return null;
}

export default async function EditMenuItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ section?: string; returnTo?: string }>;
}) {
  const { id } = await params;
  const { section: legacySection, returnTo } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = user ? await fetchConsoleAccess(supabase, user.id) : null;
  const canEditMenu = !!access?.canEditMenu;

  const { data, error } = await supabase.from("menu_items").select("*").eq("id", id).maybeSingle();

  if (error || !data) notFound();

  const row = data as MenuItemRow;

  const legacyHref =
    legacySection && isMenuSection(legacySection) ? adminSectionHref(legacySection as MenuSection) : null;

  const returnHref = safeReturnHref(returnTo) ?? legacyHref ?? adminSectionHref(row.section);
  const meta = getSectionMeta(row.section);

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: "Overview", href: "/admin" },
          { label: meta.label, href: adminSectionHref(row.section) },
          { label: row.name },
        ]}
      />
      <MenuItemForm
        initial={row}
        returnHref={returnHref}
        lastSavedAt={row.updated_at ?? null}
        navigateAfterSave={false}
        readOnly={!canEditMenu}
      />
    </div>
  );
}
