import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ADMIN_MENU_SECTIONS, adminSectionHref, isMenuSection } from "@/lib/admin-sections";
import { fetchConsoleAccess } from "@/lib/console-access";
import { formatAdminSyncTime } from "@/lib/format-admin-sync";
import { createClient } from "@/lib/supabase/server";
import type { MenuSection } from "@/types/menu";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section: legacySection } = await searchParams;
  if (legacySection && isMenuSection(legacySection)) {
    redirect(adminSectionHref(legacySection));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = user ? await fetchConsoleAccess(supabase, user.id) : null;
  const canEditMenu = !!access?.canEditProducts;

  const { data: rows, error } = await supabase.from("menu_items").select("id, section, is_active, name, updated_at");

  if (error) {
    return (
      <div className="admin-message admin-message--warning">
        <p className="admin-message-title">Could not sync with Supabase</p>
        <p style={{ margin: 0 }}>
          Confirm <code className="admin-code">.env.local</code> and that tables exist ({error.message})
        </p>
      </div>
    );
  }

  const items = rows ?? [];
  const total = items.length;
  const active = items.filter((r) => r.is_active).length;

  const bySection: Record<MenuSection, { total: number; active: number }> = {
    seasonal: { total: 0, active: 0 },
    bestsellers: { total: 0, active: 0 },
    gelato: { total: 0, active: 0 },
    sorbet: { total: 0, active: 0 },
    coffee: { total: 0, active: 0 },
    pastries: { total: 0, active: 0 },
    drinks: { total: 0, active: 0 },
    yogurt: { total: 0, active: 0 },
  };

  for (const r of items) {
    const s = r.section as MenuSection;
    if (!(s in bySection)) continue;
    bySection[s].total += 1;
    if (r.is_active) bySection[s].active += 1;
  }

  const catalogLastTouch = items.reduce<string | null>((max, r) => {
    const u = (r as { updated_at?: string }).updated_at;
    if (!u) return max;
    return !max || u > max ? u : max;
  }, null);
  const catalogSyncLabel = formatAdminSyncTime(catalogLastTouch);

  return (
    <div className="admin-stack">
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview" }]}
        title="Overview"
        description="Catalog health across all menu sections. Open a section to edit items on the public site."
        meta={
          catalogSyncLabel ? (
            <>
              Last catalog change: <strong>{catalogSyncLabel}</strong>
            </>
          ) : undefined
        }
      />

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <p className="admin-stat-label">Catalog items</p>
          <p className="admin-stat-value">{total}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat-label">Live on menu</p>
          <p className="admin-stat-value admin-stat-value--success">{active}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat-label">Hidden / staged</p>
          <p className="admin-stat-value">{total - active}</p>
        </div>
      </div>

      <div>
        <h2 className="admin-section-title" style={{ marginBottom: 12 }}>
          Sections
        </h2>
        <div className="admin-grid-tiles">
          {ADMIN_MENU_SECTIONS.map((meta) => {
            const stats = bySection[meta.id];
            const href = adminSectionHref(meta.id);
            return (
              <article key={meta.id} className="admin-tile">
                <h3 className="admin-tile-title">{meta.label}</h3>
                <p className="admin-tile-desc">{meta.description}</p>
                <p className="admin-tile-stats">
                  <strong>{stats.active}</strong> live · <strong>{stats.total}</strong> total
                </p>
                <div className="admin-tile-footer">
                  <Link href={href} className="admin-btn admin-btn--primary admin-btn--block">
                    {canEditMenu ? `Manage ${meta.label.toLowerCase()}` : `View ${meta.label.toLowerCase()}`}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
