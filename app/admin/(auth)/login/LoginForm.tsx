"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/")) return "/admin";
  if (!raw.startsWith("/admin")) return "/admin";
  return raw;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = useMemo(() => safeNextPath(searchParams.get("next")), [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const trimmed = email.trim();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      });
      if (signErr) throw signErr;
      window.location.assign(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-card">
      <div className="admin-login-brand">
        <span className="admin-sidebar-logo" style={{ margin: "0 auto 16px", width: 40, height: 40, fontSize: 18 }}>
          A
        </span>
        <p className="admin-sidebar-brand-eyebrow">Anita Gelato</p>
        <h1 className="admin-page-title" style={{ fontSize: 22, marginTop: 4 }}>
          Menu console
        </h1>
        <p className="admin-page-desc" style={{ marginTop: 8, marginLeft: "auto", marginRight: "auto" }}>
          Sign in with your staff account
        </p>
      </div>
      <form onSubmit={onSubmit} className="admin-stack-sm">
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label className="admin-label" htmlFor="admin-email">
            Work email
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
            autoComplete="username"
          />
        </div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label className="admin-label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="admin-message admin-message--error" style={{ margin: 0, padding: "10px 12px" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="admin-btn admin-btn--primary admin-btn--lg admin-btn--block"
          style={{ marginTop: 4 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
