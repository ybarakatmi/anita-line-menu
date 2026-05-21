"use client";

import { saveSectionLabelsAction } from "@/app/admin/sections-actions";
import type { SectionLabelOverride } from "@/types/menu";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SectionMeta = {
  id: string;
  displayName: string;
  defaults: Required<SectionLabelOverride>;
};

const SECTIONS: SectionMeta[] = [
  {
    id: "seasonal",
    displayName: "New & Seasonal",
    defaults: { the: "Right Now", big_line1: "New &", big_line2: "Seasonal", tag: "Spring 2026 Arrivals" },
  },
  {
    id: "bestsellers",
    displayName: "Best Sellers",
    defaults: { the: "Customer Favorites", big_line1: "Best", big_line2: "Sellers", tag: "Most loved scoops" },
  },
  {
    id: "coffee",
    displayName: "Coffee",
    defaults: { the: "Imported from Italy", big_line1: "Italian", big_line2: "Coffee", tag: "Beans Flown in from Italy" },
  },
  {
    id: "pastries",
    displayName: "New Products",
    defaults: { the: "Just in", big_line1: "New", big_line2: "Products", tag: "Pastries · Baked goods · Rotating picks" },
  },
  {
    id: "drinks",
    displayName: "Drinks",
    defaults: { the: "Also Available", big_line1: "Drinks", big_line2: "& More", tag: "Sparkling · Sodas · Water" },
  },
  {
    id: "yogurt",
    displayName: "Yogurt",
    defaults: { the: "Swirled Fresh", big_line1: "Frozen", big_line2: "Yogurt", tag: "Tart & soft serve" },
  },
  {
    id: "gelato",
    displayName: "Cream Gelato",
    defaults: { the: "Handcrafted Daily", big_line1: "Cream", big_line2: "Gelato", tag: "32 Flavors · No Artificial Colors" },
  },
  {
    id: "sorbet",
    displayName: "Sorbets & Vegan",
    defaults: { the: "Dairy-Free", big_line1: "Sorbets", big_line2: "& Vegan", tag: "100% Plant-Based" },
  },
];

type LabelsState = Record<string, Required<SectionLabelOverride>>;

function initState(saved: Record<string, SectionLabelOverride> | null): LabelsState {
  const state: LabelsState = {};
  for (const s of SECTIONS) {
    state[s.id] = {
      the: saved?.[s.id]?.the ?? "",
      big_line1: saved?.[s.id]?.big_line1 ?? "",
      big_line2: saved?.[s.id]?.big_line2 ?? "",
      tag: saved?.[s.id]?.tag ?? "",
    };
  }
  return state;
}

type Props = {
  savedLabels: Record<string, SectionLabelOverride> | null;
};

export function SectionsEditor({ savedLabels }: Props) {
  const router = useRouter();
  const [labels, setLabels] = useState<LabelsState>(() => initState(savedLabels));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(SECTIONS[0].id);

  function update(sectionId: string, field: keyof SectionLabelOverride, value: string) {
    setLabels((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [field]: value },
    }));
    setSuccess(null);
  }

  function resetSection(sectionId: string) {
    setLabels((prev) => ({
      ...prev,
      [sectionId]: { the: "", big_line1: "", big_line2: "", tag: "" },
    }));
    setSuccess(null);
  }

  function hasOverride(sectionId: string) {
    const l = labels[sectionId];
    return l && Object.values(l).some((v) => v.trim() !== "");
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await saveSectionLabelsAction(labels);
      setSuccess("Section headings saved. Changes are live on the public menu.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      {SECTIONS.map((section) => {
        const isOpen = openSection === section.id;
        const overridden = hasOverride(section.id);
        const l = labels[section.id];

        return (
          <div
            key={section.id}
            className="admin-card overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? null : section.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors"
              style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--admin-nav-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 14, fontWeight: 600 }}>{section.displayName}</span>
                {overridden && <span className="admin-badge admin-badge--success">Customised</span>}
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isOpen && (
              <div className="admin-card-body" style={{ borderTop: "1px solid var(--admin-divider)" }}>
                <p className="admin-field-hint" style={{ marginBottom: 16 }}>
                  Leave a field blank to keep the default text shown below in grey.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="admin-label">
                      Eyebrow <span className="font-normal text-slate-400">(small line above heading)</span>
                    </label>
                    <input
                      type="text"
                      value={l.the}
                      onChange={(e) => update(section.id, "the", e.target.value)}
                      placeholder={section.defaults.the}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label">
                      Tag line <span className="font-normal text-slate-400">(✦ line below heading)</span>
                    </label>
                    <input
                      type="text"
                      value={l.tag}
                      onChange={(e) => update(section.id, "tag", e.target.value)}
                      placeholder={section.defaults.tag}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label">
                      Heading — line 1
                    </label>
                    <input
                      type="text"
                      value={l.big_line1}
                      onChange={(e) => update(section.id, "big_line1", e.target.value)}
                      placeholder={section.defaults.big_line1}
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="admin-label">
                      Heading — line 2
                    </label>
                    <input
                      type="text"
                      value={l.big_line2}
                      onChange={(e) => update(section.id, "big_line2", e.target.value)}
                      placeholder={section.defaults.big_line2}
                      className="admin-input"
                    />
                  </div>
                </div>

                {/* Live preview */}
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Preview
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    {l.the || section.defaults.the}
                  </p>
                  <p className="mt-0.5 font-serif text-xl font-semibold leading-tight text-slate-900">
                    {l.big_line1 || section.defaults.big_line1}
                    {" "}
                    {l.big_line2 || section.defaults.big_line2}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    ✦ &nbsp; {l.tag || section.defaults.tag}
                  </p>
                </div>

                {overridden && (
                  <button
                    type="button"
                    onClick={() => resetSection(section.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Reset to defaults
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {error && <div className="admin-message admin-message--error">{error}</div>}
      {success && <div className="admin-message admin-message--success">{success}</div>}

      <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 8 }}>
        <button type="submit" disabled={saving} className="admin-btn admin-btn--primary admin-btn--lg">
          {saving ? "Saving…" : "Save all sections"}
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer" className="admin-link">
          Preview public menu ↗
        </a>
      </div>
    </form>
  );
}
