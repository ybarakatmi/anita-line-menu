import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

export function AdminBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && (
              <span className="select-none text-slate-300" aria-hidden>
                /
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className="font-medium text-slate-600 hover:text-slate-900">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
