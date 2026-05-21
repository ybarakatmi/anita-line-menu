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
      className="admin-card admin-card-padded admin-stack-sm"
      style={{ maxWidth: "42rem" }}
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="admin-label" htmlFor="ticket-subject">
            Subject
          </label>
          <input
            id="ticket-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={140}
            placeholder="Short summary"
            className="admin-input"
            disabled={loading}
          />
        </div>
        <div className="space-y-1">
          <label className="admin-label" htmlFor="ticket-message">
            Details
          </label>
          <textarea
            id="ticket-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={4000}
            rows={6}
            placeholder="Steps to reproduce, what you expected, what actually happened…"
            className="admin-textarea"
            disabled={loading}
          />
        </div>
        {error && <p className="admin-message admin-message--error" style={{ margin: 0, padding: "8px 12px" }}>{error}</p>}
        {success && <p className="admin-message admin-message--success" style={{ margin: 0, padding: "8px 12px" }}>{success}</p>}
        <button
          type="submit"
          disabled={loading || !subject.trim() || !message.trim()}
          className="admin-btn admin-btn--primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send ticket"}
        </button>
      </form>
    </section>
  );
}
