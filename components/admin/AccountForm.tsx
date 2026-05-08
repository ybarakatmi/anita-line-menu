"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Props = {
  currentEmail: string;
};

export function AccountForm({ currentEmail }: Props) {
  return (
    <section className="max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-900">Account</h2>
        <p className="text-sm text-slate-600">Update your sign-in email or password.</p>
      </header>
      <ChangeEmailForm currentEmail={currentEmail} />
      <div className="border-t border-slate-200" />
      <ChangePasswordForm />
    </section>
  );
}

function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const next = email.trim();
    if (!next) {
      setError("Enter a new email address.");
      return;
    }
    if (next.toLowerCase() === currentEmail.toLowerCase()) {
      setError("That's already your email.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ email: next });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess(`Confirmation email sent to ${next}. Click the link from that inbox to finish the change.`);
    setEmail("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="account-email">
          New email
        </label>
        <p className="text-xs text-slate-500">Currently signed in as {currentEmail}</p>
        <input
          id="account-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          disabled={loading}
        />
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending…" : "Update email"}
      </button>
    </form>
  );
}

function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSuccess("Password updated.");
    setPassword("");
    setConfirm("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="account-password">
          New password
        </label>
        <input
          id="account-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          disabled={loading}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="account-password-confirm">
          Confirm new password
        </label>
        <input
          id="account-password-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          disabled={loading}
        />
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {success && <p className="text-sm text-emerald-700">{success}</p>}
      <button
        type="submit"
        disabled={loading || !password || !confirm}
        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
