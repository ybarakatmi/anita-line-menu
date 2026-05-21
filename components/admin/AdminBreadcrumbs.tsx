import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

export function AdminBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="admin-breadcrumbs">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {index > 0 && (
              <span className="admin-breadcrumbs-sep" aria-hidden>
                ›
              </span>
            )}
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
