import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { QrBuilder } from "@/components/admin/QrBuilder";
import { resolvePublicOrigin } from "@/lib/resolve-public-origin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const origin = (await resolvePublicOrigin()) ?? "https://www.anitagelatola.net";

  return (
    <div className="admin-stack">
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: "QR codes" }]}
        eyebrow="Tracking"
        title="QR code builder"
        description="Make a QR code for each place you put one — the counter, a table tent, the window. Each code tags its own scans, so the menu reports show which spots actually get used."
      />

      <QrBuilder origin={origin} />
    </div>
  );
}
