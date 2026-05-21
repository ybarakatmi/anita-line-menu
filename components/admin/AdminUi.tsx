/** Shared admin form primitives — Fluent-style, used across editors */

export function AdminCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card admin-card-padded admin-stack-sm ${className}`.trim()}>
      <div>
        <h2 className="admin-section-title">{title}</h2>
        {description ? <p className="admin-page-desc" style={{ marginTop: 6 }}>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-field">
      <label className="admin-label">
        {label}
        {hint ? <span className="admin-label-hint"> ({hint})</span> : null}
      </label>
      {children}
    </div>
  );
}

export function adminInputClass() {
  return "admin-input";
}
