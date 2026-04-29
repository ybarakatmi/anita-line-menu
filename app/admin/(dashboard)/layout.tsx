import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { fetchConsoleAccess } from "@/lib/console-access";
import { createClient } from "@/lib/supabase/server";
import type { MenuSection } from "@/types/menu";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    redirect("/admin/misconfigured");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const access = await fetchConsoleAccess(supabase, user.id);
  if (!access) redirect("/admin/login");

  const { data: liveRows } = await supabase.from("menu_items").select("section").eq("is_active", true);
  const { data: totalRows } = await supabase.from("menu_items").select("section");

  const liveCounts: Record<MenuSection, number> = {
    seasonal: 0,
    bestsellers: 0,
    gelato: 0,
    sorbet: 0,
    coffee: 0,
    drinks: 0,
  };
  const totalCounts: Record<MenuSection, number> = {
    seasonal: 0,
    bestsellers: 0,
    gelato: 0,
    sorbet: 0,
    coffee: 0,
    drinks: 0,
  };

  for (const row of liveRows ?? []) {
    const s = row.section as MenuSection;
    if (s in liveCounts) liveCounts[s] += 1;
  }

  for (const row of totalRows ?? []) {
    const s = row.section as MenuSection;
    if (s in totalCounts) totalCounts[s] += 1;
  }

  return (
    <AdminAppShell liveCounts={liveCounts} totalCounts={totalCounts} access={access}>
      {children}
    </AdminAppShell>
  );
}
