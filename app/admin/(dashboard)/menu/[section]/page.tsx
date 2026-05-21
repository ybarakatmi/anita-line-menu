import { duplicateMenuItemAction, reorderMenuItemAction } from "@/app/admin/menu-actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
      <div className="admin-message admin-message--warning">
        <p className="admin-message-title">Could not load this section</p>
        <p style={{ margin: 0 }}>{error.message}</p>
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
    <div className="admin-stack">
      <AdminPageHeader
        breadcrumbs={[{ label: "Overview", href: "/admin" }, { label: meta.label }]}
        eyebrow="Menu section"
        title={meta.label}
        description={meta.description}
        meta={
          sectionSyncLabel ? (
            <>
              Most recent change: <strong>{sectionSyncLabel}</strong>
            </>
          ) : undefined
        }
        actions={
          <>
            <span className="admin-meta" style={{ alignSelf: "center" }}>
              <strong>{live}</strong> live · <strong>{rows.length}</strong> total
            </span>
            {canEditMenu ? (
              <Link
                href={`/admin/items/new?section=${section}&returnTo=${encodeURIComponent(returnHref)}`}
                className="admin-btn admin-btn--primary"
              >
                Add item
              </Link>
            ) : (
              <span className="admin-meta">View only — contact an owner or manager to edit.</span>
            )}
          </>
        }
      />

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Order</th>
                {canEditMenu ? (
                  <>
                    <th>Actions</th>
                    <th />
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{row.name}</div>
                    {row.description && (
                      <div className="admin-meta" style={{ marginTop: 2 }}>
                        {row.description}
                      </div>
                    )}
                  </td>
                  <td>
                    {row.is_active ? (
                      <span className="admin-badge admin-badge--success">Live</span>
                    ) : (
                      <span className="admin-badge admin-badge--neutral">Hidden</span>
                    )}
                  </td>
                  <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--admin-text-secondary)" }}>
                    {row.sort_order}
                  </td>
                  {canEditMenu ? (
                    <>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          <form action={reorderMenuItemAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="direction" value="up" />
                            <input type="hidden" name="returnTo" value={returnHref} />
                            <input type="hidden" name="section" value={section} />
                            <button type="submit" className="admin-btn admin-btn--secondary" style={{ minHeight: 28, padding: "4px 10px", fontSize: 12 }} title="Move up">
                              Up
                            </button>
                          </form>
                          <form action={reorderMenuItemAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="direction" value="down" />
                            <input type="hidden" name="returnTo" value={returnHref} />
                            <input type="hidden" name="section" value={section} />
                            <button type="submit" className="admin-btn admin-btn--secondary" style={{ minHeight: 28, padding: "4px 10px", fontSize: 12 }} title="Move down">
                              Down
                            </button>
                          </form>
                          <form action={duplicateMenuItemAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="returnTo" value={returnHref} />
                            <input type="hidden" name="section" value={section} />
                            <button type="submit" className="admin-btn admin-btn--secondary" style={{ minHeight: 28, padding: "4px 10px", fontSize: 12 }} title="Duplicate">
                              Duplicate
                            </button>
                          </form>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link href={`/admin/items/${row.id}?returnTo=${encodeURIComponent(returnHref)}`} className="admin-link">
                          Edit
                        </Link>
                      </td>
                    </>
                  ) : (
                    <td style={{ textAlign: "right" }} colSpan={2}>
                      <Link href={`/admin/items/${row.id}?returnTo=${encodeURIComponent(returnHref)}`} className="admin-link">
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
          <div className="admin-card-body" style={{ textAlign: "center", color: "var(--admin-text-secondary)" }}>
            No items in this section yet. Add one to sync the public menu.
          </div>
        )}
      </div>
    </div>
  );
}
