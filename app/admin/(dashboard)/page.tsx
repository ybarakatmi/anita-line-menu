import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
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
  const canEditMenu = !!access?.canEditMenu;

  const { data: rows, error } = await supabase.from("menu_items").select("id, section, is_active, name, updated_at");

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">Could not sync with Supabase</p>
        <p className="mt-1 text-amber-800/90">
          Confirm <code className="rounded bg-white px-1.5 py-0.5 text-xs">.env.local</code> and that tables exist
          ({error.message})
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
    <div className="space-y-8">
      <div className="space-y-2">
        <AdminBreadcrumbs items={[{ label: "Overview" }]} />
        {catalogSyncLabel && (
          <p className="text-xs text-slate-500">
            Last catalog change (any section):{" "}
            <span className="font-medium text-slate-700">{catalogSyncLabel}</span>
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Manage each public menu block independently. Changes save to Supabase and appear on the customer-facing
          page for this location.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Catalog items</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Live on menu</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-700">{active}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Hidden / staged</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-700">{total - active}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Sections</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ADMIN_MENU_SECTIONS.map((meta) => {
            const stats = bySection[meta.id];
            const href = adminSectionHref(meta.id);
            return (
              <div
                key={meta.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{meta.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{meta.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-3 text-sm text-slate-600">
                  <span>
                    <span className="font-medium text-slate-900">{stats.active}</span> live
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>
                    <span className="font-medium text-slate-900">{stats.total}</span> total
                  </span>
                </div>
                <div className="mt-5">
                  <Link
                    href={href}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    {canEditMenu ? `Manage ${meta.label.toLowerCase()}` : `View ${meta.label.toLowerCase()}`}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
