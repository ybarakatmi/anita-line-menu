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
      // Full page load so the next request always includes the new session cookies.
      // Client-only router.replace + refresh can race Supabase cookie writes and bounce
      // back to /admin/login with no visible error.
      window.location.assign(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Anita</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Menu console</h1>
        <p className="mt-2 text-sm text-slate-600">Authorized operators only. Activity is tied to your Supabase account.</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="block text-sm font-medium text-slate-700">
          Work email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-base text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            autoComplete="username"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-base text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
