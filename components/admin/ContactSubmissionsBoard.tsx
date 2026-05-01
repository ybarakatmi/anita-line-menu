"use client";

import { formatAdminSyncTime } from "@/lib/format-admin-sync";
import type { ContactSubmissionRow } from "@/types/contact-submission";
import { useEffect, useState } from "react";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{submissions.length}</span>
            {submissions.length >= 500 ? " (most recent 500)" : ""}
          </p>
          <p className="mt-1 text-xs text-slate-500">Click a row to open details in the side panel.</p>
        </div>
        <ul className="divide-y divide-slate-100" role="list">
          {submissions.map((s) => {
            const open = selectedId === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(open ? null : s.id)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 ${
                    open ? "bg-slate-50 ring-inset ring-1 ring-slate-200/80" : ""
                  }`}
                  aria-expanded={open}
                  aria-controls={`submission-panel-${s.id}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900">{s.name}</span>
                    <span className="mt-0.5 block truncate text-sm text-slate-600">{s.email}</span>
                    {s.subject && (
                      <span className="mt-1 line-clamp-1 text-xs text-slate-500">Re: {s.subject}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-right">
                    <time className="block text-xs tabular-nums text-slate-500" dateTime={s.created_at}>
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
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]"
            aria-label="Close details"
            onClick={() => setSelectedId(null)}
          />
          <aside
            id={`submission-panel-${selected.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submission-panel-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h2 id="submission-panel-title" className="text-lg font-semibold text-slate-900">
                  Contact inquiry
                </h2>
                <p className="mt-1 text-xs text-slate-500 tabular-nums">
                  {formatAdminSyncTime(selected.created_at) ?? selected.created_at}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
                    className="font-medium text-slate-700 underline-offset-2 hover:underline"
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
                    <span className="text-slate-400">—</span>
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
                    <span className="text-slate-400">—</span>
                  )}
                </DetailRow>
              </dl>
              <p className="mt-6 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                Reference ID: <code className="font-mono text-slate-700">{selected.id}</code>
              </p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
