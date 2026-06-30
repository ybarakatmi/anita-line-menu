import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MenuSectionsManager } from "@/components/admin/MenuSectionsManager";
import { fetchConsoleAccess } from "@/lib/console-access";
import { fetchMenuSections } from "@/lib/menu-sections";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMenuSectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const access = await fetchConsoleAccess(supabase, user.id);
  if (!access?.canEditSections) redirect("/admin");

  const [sections, itemsRes] = await Promise.all([
    fetchMenuSections(supabase),
    supabase.from("menu_items").select("section, is_active"),
  ]);

  const stats: Record<string, { live: number; total: number }> = {};
  for (const row of sections) {
    stats[row.id] = { live: 0, total: 0 };
  }
  for (const row of itemsRes.data ?? []) {
    const id = row.section as string;
    if (!stats[id]) stats[id] = { live: 0, total: 0 };
    stats[id].total += 1;
    if (row.is_active) stats[id].live += 1;
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "Menu sections" }]}
        eyebrow="Presentation"
        title="Menu sections"
        description="Add custom sections to the public menu, reorder them, and control their headings. Built-in sections keep their specialized layouts but can be hidden or reordered."
      />

      <MenuSectionsManager sections={sections} stats={stats} />
    </div>
  );
}
