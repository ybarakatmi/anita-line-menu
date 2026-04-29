import { duplicateMenuItemAction, reorderMenuItemAction } from "@/app/admin/menu-actions";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { adminSectionHref, getSectionMeta, isMenuSection } from "@/lib/admin-sections";
import { fetchConsoleAccess } from "@/lib/console-access";
import { formatAdminSyncTime } from "@/lib/format-admin-sync";
import { createClient } from "@/lib/supabase/server";
import type { MenuItemRow, MenuSection } from "@/types/menu";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMenuSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: raw } = await params;
  if (!isMenuSection(raw)) notFound();
  const section: MenuSection = raw;
  const meta = getSectionMeta(section);
  const returnHref = adminSectionHref(section);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = user ? await fetchConsoleAccess(supabase, user.id) : null;
  const canEditMenu = !!access?.canEditMenu;

  const { data: items, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("section", section)
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">Could not load this section</p>
        <p className="mt-1 text-amber-800/90">{error.message}</p>
      </div>
    );
  }

  const rows = (items ?? []) as MenuItemRow[];
  const live = rows.filter((r) => r.is_active).length;

  const lastSectionTouch = rows.reduce<string | null>((max, r) => {
    const u = r.updated_at;
    if (!u) return max;
    return !max || u > max ? u : max;
  }, null);
  const sectionSyncLabel = formatAdminSyncTime(lastSectionTouch);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <AdminBreadcrumbs items={[{ label: "Overview", href: "/admin" }, { label: meta.label }]} />
        {sectionSyncLabel && (
          <p className="text-xs text-slate-500">
            Most recent change in this section:{" "}
            <span className="font-medium text-slate-700">{sectionSyncLabel}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Menu section</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{meta.label}</h1>
          <p className="max-w-2xl text-sm text-slate-600">{meta.description}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <div className="text-right text-sm text-slate-600">
            <span className="font-medium text-slate-900">{live}</span> live ·{" "}
            <span className="font-medium text-slate-900">{rows.length}</span> total
          </div>
          {canEditMenu ? (
            <Link
              href={`/admin/items/new?section=${section}&returnTo=${encodeURIComponent(returnHref)}`}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add item
            </Link>
          ) : (
            <span className="text-xs font-medium text-slate-500">View only — ask an owner or manager to edit.</span>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Order</th>
                {canEditMenu ? (
                  <>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                    <th className="px-4 py-3" />
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{row.name}</div>
                    {row.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">{row.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.is_active ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{row.sort_order}</td>
                  {canEditMenu ? (
                    <>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <form action={reorderMenuItemAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="direction" value="up" />
                            <input type="hidden" name="returnTo" value={returnHref} />
                            <input type="hidden" name="section" value={section} />
                            <button
                              type="submit"
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              title="Move up"
                            >
                              Up
                            </button>
                          </form>
                          <form action={reorderMenuItemAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="direction" value="down" />
                            <input type="hidden" name="returnTo" value={returnHref} />
                            <input type="hidden" name="section" value={section} />
                            <button
                              type="submit"
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              title="Move down"
                            >
                              Down
                            </button>
                          </form>
                          <form action={duplicateMenuItemAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="returnTo" value={returnHref} />
                            <input type="hidden" name="section" value={section} />
                            <button
                              type="submit"
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              title="Duplicate"
                            >
                              Duplicate
                            </button>
                          </form>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/items/${row.id}?returnTo=${encodeURIComponent(returnHref)}`}
                          className="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </>
                  ) : (
                    <td className="px-4 py-3 text-right" colSpan={2}>
                      <Link
                        href={`/admin/items/${row.id}?returnTo=${encodeURIComponent(returnHref)}`}
                        className="text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                      >
                        View
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-600">
            No items in this section yet. Add one to sync the public menu.
          </div>
        )}
      </div>
    </div>
  );
}
