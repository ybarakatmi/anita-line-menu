"use client";

import { formatAdminSyncTime } from "@/lib/format-admin-sync";
import type { ContactSubmissionRow } from "@/types/contact-submission";
import { useEffect, useState } from "react";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: "1px solid var(--admin-divider)", padding: "12px 0" }}>
      <dt className="admin-eyebrow" style={{ fontSize: 10 }}>{label}</dt>
      <dd style={{ margin: "6px 0 0", fontSize: 14 }}>{children}</dd>
    </div>
  );
}

export function ContactSubmissionsBoard({ submissions }: { submissions: ContactSubmissionRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = submissions.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (selectedId) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedId]);

  return (
    <>
      <div className="admin-table-wrap">
        <div className="admin-card-header">
          <p className="admin-page-desc" style={{ margin: 0 }}>
            Showing <strong>{submissions.length}</strong>
            {submissions.length >= 500 ? " (most recent 500)" : ""}
          </p>
          <p className="admin-field-hint" style={{ marginTop: 4 }}>Click a row to open details in the side panel.</p>
        </div>
        <ul role="list" style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {submissions.map((s) => {
            const open = selectedId === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(open ? null : s.id)}
                  className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors"
                  style={{
                    border: "none",
                    borderBottom: "1px solid var(--admin-divider)",
                    background: open ? "var(--admin-brand-subtle)" : "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    if (!open) e.currentTarget.style.background = "var(--admin-nav-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!open) e.currentTarget.style.background = "transparent";
                  }}
                  aria-expanded={open}
                  aria-controls={`submission-panel-${s.id}`}
                >
                  <span className="min-w-0 flex-1">
                    <span style={{ display: "block", fontWeight: 600 }}>{s.name}</span>
                    <span className="admin-meta" style={{ display: "block", marginTop: 2 }}>{s.email}</span>
                    {s.subject && (
                      <span className="admin-field-hint" style={{ display: "block", marginTop: 4 }}>Re: {s.subject}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-right">
                    <time className="admin-meta" style={{ display: "block" }} dateTime={s.created_at}>
                      {formatAdminSyncTime(s.created_at) ?? s.created_at}
                    </time>
                    <span className="mt-2 block text-slate-400" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="ml-auto">
                        <path
                          d="M9 18l6-6-6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selected && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            style={{ background: "rgba(36, 36, 36, 0.4)", border: "none" }}
            aria-label="Close details"
            onClick={() => setSelectedId(null)}
          />
          <aside
            id={`submission-panel-${selected.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-panel-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col"
            style={{
              borderLeft: "1px solid var(--admin-border)",
              background: "var(--admin-canvas)",
              boxShadow: "var(--admin-shadow-md)",
            }}
          >
            <div className="admin-card-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div className="min-w-0">
                <h2 id="submission-panel-title" className="admin-section-title">
                  Contact inquiry
                </h2>
                <p className="admin-meta" style={{ marginTop: 4 }}>
                  {formatAdminSyncTime(selected.created_at) ?? selected.created_at}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="admin-btn admin-btn--ghost"
                style={{ minWidth: 36, padding: 8 }}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <dl>
                <DetailRow label="Name">{selected.name}</DetailRow>
                <DetailRow label="Email">
                  <a
                    href={`mailto:${encodeURIComponent(selected.email)}`}
                    className="admin-link"
                  >
                    {selected.email}
                  </a>
                </DetailRow>
                <DetailRow label="Phone">
                  {selected.phone ? (
                    <a href={`tel:${selected.phone.replace(/\s+/g, "")}`} className="hover:underline">
                      {selected.phone}
                    </a>
                  ) : (
                    <span className="admin-meta">—</span>
                  )}
                </DetailRow>
                <DetailRow label="Country">
                  {selected.country?.trim() ? selected.country : <span className="text-slate-400">—</span>}
                </DetailRow>
                <DetailRow label="Subject">
                  {selected.subject?.trim() ? selected.subject : <span className="text-slate-400">—</span>}
                </DetailRow>
                <DetailRow label="Message">
                  {selected.message?.trim() ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                  ) : (
                    <span className="admin-meta">—</span>
                  )}
                </DetailRow>
              </dl>
              <p className="admin-meta" style={{ marginTop: 24, padding: "10px 12px", background: "var(--admin-bg)", borderRadius: "var(--admin-radius)" }}>
                Reference ID: <code className="admin-code">{selected.id}</code>
              </p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
