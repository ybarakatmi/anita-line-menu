import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { getAdminMenuSections } from "@/lib/admin-sections";
import { fetchConsoleAccess } from "@/lib/console-access";
import { createClient } from "@/lib/supabase/server";
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

  const adminSections = await getAdminMenuSections(supabase);
  const { data: liveRows } = await supabase.from("menu_items").select("section").eq("is_active", true);
  const { data: totalRows } = await supabase.from("menu_items").select("section");

  const liveCounts: Record<string, number> = {};
  const totalCounts: Record<string, number> = {};
  for (const section of adminSections) {
    liveCounts[section.id] = 0;
    totalCounts[section.id] = 0;
  }

  for (const row of liveRows ?? []) {
    const s = row.section as string;
    if (!(s in liveCounts)) liveCounts[s] = 0;
    liveCounts[s] += 1;
  }

  for (const row of totalRows ?? []) {
    const s = row.section as string;
    if (!(s in totalCounts)) totalCounts[s] = 0;
    totalCounts[s] += 1;
  }

  return (
    <AdminAppShell
      adminSections={adminSections}
      liveCounts={liveCounts}
      totalCounts={totalCounts}
      access={access}
    >
      {children}
    </AdminAppShell>
  );
}
