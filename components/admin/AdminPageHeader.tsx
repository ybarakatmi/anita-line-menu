import { AdminBreadcrumbs, type BreadcrumbItem } from "@/components/admin/AdminBreadcrumbs";

type Props = {
  breadcrumbs: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
};

export function AdminPageHeader({
  breadcrumbs,
  eyebrow,
  title,
  description,
  meta,
  actions,
}: Props) {
  return (
    <header className="admin-page-header">
      <AdminBreadcrumbs items={breadcrumbs} />
      <div className="admin-page-header-top">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {eyebrow ? <p className="admin-eyebrow">{eyebrow}</p> : null}
          <h1 className="admin-page-title">{title}</h1>
          {description ? <p className="admin-page-desc">{description}</p> : null}
          {meta ? <div className="admin-meta" style={{ marginTop: 4 }}>{meta}</div> : null}
        </div>
        {actions ? <div className="admin-page-header-actions">{actions}</div> : null}
      </div>
    </header>
  );
}
