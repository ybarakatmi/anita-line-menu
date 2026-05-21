"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Props = {
  currentEmail: string;
};

export function AccountForm({ currentEmail }: Props) {
  return (
    <section className="admin-card admin-card-padded admin-stack-sm" style={{ maxWidth: "42rem" }}>
      <header>
        <h2 className="admin-section-title">Account</h2>
        <p className="admin-page-desc" style={{ marginTop: 6 }}>Update your sign-in email or password.</p>
      </header>
      <ChangeEmailForm currentEmail={currentEmail} />
      <div style={{ borderTop: "1px solid var(--admin-divider)" }} />
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
        <label className="admin-label" htmlFor="account-email">
          New email
        </label>
        <p className="admin-field-hint">Currently signed in as {currentEmail}</p>
        <input
          id="account-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="admin-input"
          disabled={loading}
        />
      </div>
      {error && <p className="admin-message admin-message--error" style={{ margin: 0, padding: "8px 12px" }}>{error}</p>}
      {success && <p className="admin-message admin-message--success" style={{ margin: 0, padding: "8px 12px" }}>{success}</p>}
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="admin-btn admin-btn--primary disabled:cursor-not-allowed disabled:opacity-60"
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
        <label className="admin-label" htmlFor="account-password">
          New password
        </label>
        <input
          id="account-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-input"
          disabled={loading}
        />
      </div>
      <div className="space-y-1">
        <label className="admin-label" htmlFor="account-password-confirm">
          Confirm new password
        </label>
        <input
          id="account-password-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="admin-input"
          disabled={loading}
        />
      </div>
      {error && <p className="admin-message admin-message--error" style={{ margin: 0, padding: "8px 12px" }}>{error}</p>}
      {success && <p className="admin-message admin-message--success" style={{ margin: 0, padding: "8px 12px" }}>{success}</p>}
      <button
        type="submit"
        disabled={loading || !password || !confirm}
        className="admin-btn admin-btn--primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
