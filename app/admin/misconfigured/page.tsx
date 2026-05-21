export default function AdminMisconfiguredPage() {
  return (
    <div className="admin-login-shell">
      <div className="admin-login-card" style={{ maxWidth: 480, textAlign: "left" }}>
        <h1 className="admin-section-title" style={{ fontSize: 18 }}>
          Supabase environment is not set
        </h1>
        <p className="admin-page-desc" style={{ marginTop: 12 }}>
          The admin console needs public Supabase credentials. Add these to{" "}
          <code className="admin-code">.env.local</code> in the project root, then restart{" "}
          <code className="admin-code">npm run dev</code>:
        </p>
        <ul style={{ margin: "16px 0", paddingLeft: 20, fontSize: 13, color: "var(--admin-text-secondary)" }}>
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
        <p className="admin-page-desc">
          Optional for email invites from Settings:{" "}
          <code className="admin-code">SUPABASE_SERVICE_ROLE_KEY</code> (server only, never commit).
        </p>
      </div>
    </div>
  );
}
