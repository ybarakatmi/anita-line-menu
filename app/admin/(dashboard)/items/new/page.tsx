import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { adminSectionHref, getSectionMeta, isMenuSection } from "@/lib/admin-sections";
import { fetchConsoleAccess } from "@/lib/console-access";
import { createClient } from "@/lib/supabase/server";
import type { MenuSection } from "@/types/menu";
import { redirect } from "next/navigation";

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

export default async function NewMenuItemPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; returnTo?: string }>;
}) {
  const { section, returnTo } = await searchParams;
  const initialSection: MenuSection = isMenuSection(section ?? "") ? (section as MenuSection) : "gelato";
  const returnHref = safeReturnHref(returnTo) ?? "/admin";
  const meta = getSectionMeta(initialSection);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = user ? await fetchConsoleAccess(supabase, user.id) : null;
  if (!access?.canEditMenu) {
    redirect(adminSectionHref(initialSection));
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        items={[
          { label: "Overview", href: "/admin" },
          { label: meta.label, href: adminSectionHref(initialSection) },
          { label: "New item" },
        ]}
      />
      <MenuItemForm initial={null} initialSection={initialSection} returnHref={returnHref} />
    </div>
  );
}
