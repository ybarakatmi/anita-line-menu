export function AdminLoadingScreen() {
  return (
    <div className="admin-loading">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <span className="admin-sidebar-logo" style={{ width: 48, height: 48, fontSize: 20 }}>
          A
        </span>
        <div style={{ textAlign: "center" }}>
          <p className="admin-sidebar-brand-eyebrow">Anita Gelato</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "var(--admin-text-secondary)" }}>
            Menu console
          </p>
        </div>
      </div>
      <div className="admin-loading-bar" aria-hidden />
      <p className="admin-meta">Loading workspace…</p>
    </div>
  );
}
