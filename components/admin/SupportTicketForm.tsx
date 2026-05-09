"use client";

import { submitSupportTicket } from "@/app/admin/support-actions";
import { useState } from "react";

export function SupportTicketForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const fd = new FormData();
    fd.set("subject", subject);
    fd.set("message", message);

    const result = await submitSupportTicket(fd);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess("Ticket sent. We'll be in touch.");
    setSubject("");
    setMessage("");
  }

  return (
    <section
      aria-label="Support ticket"
      className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="ticket-subject">
            Subject
          </label>
          <input
            id="ticket-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={140}
            placeholder="Short summary"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            disabled={loading}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="ticket-message">
            Details
          </label>
          <textarea
            id="ticket-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={4000}
            rows={6}
            placeholder="Steps to reproduce, what you expected, what actually happened…"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            disabled={loading}
          />
        </div>
        {error && <p className="text-sm text-rose-700">{error}</p>}
        {success && <p className="text-sm text-emerald-700">{success}</p>}
        <button
          type="submit"
          disabled={loading || !subject.trim() || !message.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send ticket"}
        </button>
      </form>
    </section>
  );
}
