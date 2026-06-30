"use client";

import {
  createMenuSectionAction,
  deleteMenuSectionAction,
  reorderMenuSectionAction,
  updateMenuSectionAction,
  type MenuSectionInput,
} from "@/app/admin/menu-sections-actions";
import { adminSectionHref } from "@/lib/admin-sections";
import { slugifySectionId } from "@/lib/menu-sections";
import type { MenuSectionLayout, MenuSectionRow } from "@/types/menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SectionStats = {
  live: number;
  total: number;
};

type Props = {
  sections: MenuSectionRow[];
  stats: Record<string, SectionStats>;
  readOnly?: boolean;
};

type FormState = {
  label: string;
  slug: string;
  description: string;
  layout: MenuSectionLayout;
  is_active: boolean;
  heading_the: string;
  heading_big_line1: string;
  heading_big_line2: string;
  heading_tag: string;
};

const EMPTY_FORM: FormState = {
  label: "",
  slug: "",
  description: "",
  layout: "carousel",
  is_active: true,
  heading_the: "",
  heading_big_line1: "",
  heading_big_line2: "",
  heading_tag: "",
};

function rowToForm(row: MenuSectionRow): FormState {
  return {
    label: row.label,
    slug: row.id,
    description: row.description,
    layout: row.layout === "system" ? "carousel" : row.layout,
    is_active: row.is_active,
    heading_the: row.heading_the ?? "",
    heading_big_line1: row.heading_big_line1 ?? "",
    heading_big_line2: row.heading_big_line2 ?? "",
    heading_tag: row.heading_tag ?? "",
  };
}

function formToInput(form: FormState, existingId?: string): MenuSectionInput {
  return {
    id: existingId ?? form.slug.trim(),
    label: form.label,
    description: form.description,
    layout: form.layout,
    is_active: form.is_active,
    heading_the: form.heading_the || null,
    heading_big_line1: form.heading_big_line1 || null,
    heading_big_line2: form.heading_big_line2 || null,
    heading_tag: form.heading_tag || null,
  };
}

export function MenuSectionsManager({ sections, stats, readOnly = false }: Props) {
  const router = useRouter();
  const ordered = useMemo(
    () => [...sections].sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)),
    [sections]
  );

  const [panel, setPanel] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const editingRow = editingId ? ordered.find((s) => s.id === editingId) : null;

  function openCreate() {
    setPanel("create");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setError(null);
    setSuccess(null);
  }

  function openEdit(row: MenuSectionRow) {
    setPanel("edit");
    setEditingId(row.id);
    setForm(rowToForm(row));
    setSlugTouched(true);
    setError(null);
    setSuccess(null);
  }

  function closePanel() {
    setPanel("list");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "label" && !slugTouched && panel === "create") {
        next.slug = slugifySectionId(String(value));
      }
      return next;
    });
    setSuccess(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (panel === "create") {
        const result = await createMenuSectionAction(formToInput(form));
        setSuccess(`Section "${form.label}" created. Add items from Manage items below.`);
        router.refresh();
        closePanel();
        void result;
      } else if (editingId) {
        await updateMenuSectionAction({ ...formToInput(form, editingId), id: editingId });
        setSuccess("Section saved.");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function onReorder(id: string, direction: "up" | "down") {
    if (readOnly) return;
    setError(null);
    try {
      await reorderMenuSectionAction({ id, direction });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reorder section.");
    }
  }

  async function onDelete(id: string) {
    if (readOnly) return;
    if (!window.confirm("Delete this section? This cannot be undone.")) return;
    setError(null);
    try {
      await deleteMenuSectionAction(id);
      setSuccess("Section deleted.");
      closePanel();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete section.");
    }
  }

  return (
    <div className="admin-stack">
      {error ? (
        <div className="admin-message admin-message--warning">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : null}
      {success ? (
        <div className="admin-message admin-message--success">
          <p style={{ margin: 0 }}>{success}</p>
        </div>
      ) : null}

      {panel === "list" ? (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {!readOnly ? (
              <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
                Add section
              </button>
            ) : null}
          </div>

          <div className="admin-table-wrap">
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Layout</th>
                    <th>Items</th>
                    <th>Status</th>
                    {!readOnly ? <th>Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((row, index) => {
                    const s = stats[row.id] ?? { live: 0, total: 0 };
                    return (
                      <tr key={row.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{row.label}</div>
                          <div className="admin-meta">{row.id}{row.is_system ? " · built-in" : ""}</div>
                          {row.description ? (
                            <div className="admin-meta" style={{ marginTop: 4 }}>{row.description}</div>
                          ) : null}
                        </td>
                        <td>{row.layout}</td>
                        <td>
                          <strong>{s.live}</strong> live · <strong>{s.total}</strong> total
                        </td>
                        <td>{row.is_active ? "Active" : "Hidden"}</td>
                        {!readOnly ? (
                          <td>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              <Link href={adminSectionHref(row.id)} className="admin-btn admin-btn--secondary">
                                Manage items
                              </Link>
                              <button type="button" className="admin-btn admin-btn--secondary" onClick={() => openEdit(row)}>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--ghost"
                                disabled={index === 0}
                                onClick={() => onReorder(row.id, "up")}
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--ghost"
                                disabled={index === ordered.length - 1}
                                onClick={() => onReorder(row.id, "down")}
                              >
                                Down
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <form className="admin-stack" onSubmit={onSubmit}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="admin-btn admin-btn--secondary" onClick={closePanel}>
              Back to list
            </button>
            {editingRow && !readOnly ? (
              <Link href={adminSectionHref(editingRow.id)} className="admin-btn admin-btn--secondary">
                Manage items
              </Link>
            ) : null}
          </div>

          <div className="admin-form-grid">
            <label className="admin-field">
              <span className="admin-field-label">Section name</span>
              <input
                className="admin-input"
                value={form.label}
                onChange={(e) => updateForm("label", e.target.value)}
                required
                disabled={readOnly}
              />
            </label>

            {panel === "create" ? (
              <label className="admin-field">
                <span className="admin-field-label">URL id (slug)</span>
                <input
                  className="admin-input"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    updateForm("slug", slugifySectionId(e.target.value));
                  }}
                  required
                  disabled={readOnly}
                />
                <span className="admin-field-hint">Lowercase letters, numbers, and hyphens only.</span>
              </label>
            ) : (
              <label className="admin-field">
                <span className="admin-field-label">Section id</span>
                <input className="admin-input" value={form.slug} disabled />
              </label>
            )}

            <label className="admin-field admin-field--full">
              <span className="admin-field-label">Description (admin only)</span>
              <textarea
                className="admin-input"
                rows={2}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                disabled={readOnly}
              />
            </label>

            {!editingRow?.is_system ? (
              <label className="admin-field">
                <span className="admin-field-label">Public layout</span>
                <select
                  className="admin-input"
                  value={form.layout}
                  onChange={(e) => updateForm("layout", e.target.value as MenuSectionLayout)}
                  disabled={readOnly}
                >
                  <option value="carousel">Carousel (like New Products)</option>
                  <option value="grid">Grid (like Drinks)</option>
                </select>
              </label>
            ) : null}

            <label className="admin-field" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => updateForm("is_active", e.target.checked)}
                disabled={readOnly}
              />
              <span className="admin-field-label" style={{ margin: 0 }}>Active on public menu</span>
            </label>
          </div>

          <div>
            <h3 className="admin-section-title">Public headings</h3>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span className="admin-field-label">Eyebrow</span>
                <input
                  className="admin-input"
                  value={form.heading_the}
                  onChange={(e) => updateForm("heading_the", e.target.value)}
                  disabled={readOnly}
                />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Heading line 1</span>
                <input
                  className="admin-input"
                  value={form.heading_big_line1}
                  onChange={(e) => updateForm("heading_big_line1", e.target.value)}
                  disabled={readOnly}
                />
              </label>
              <label className="admin-field">
                <span className="admin-field-label">Heading line 2</span>
                <input
                  className="admin-input"
                  value={form.heading_big_line2}
                  onChange={(e) => updateForm("heading_big_line2", e.target.value)}
                  disabled={readOnly}
                />
              </label>
              <label className="admin-field admin-field--full">
                <span className="admin-field-label">Tag line</span>
                <input
                  className="admin-input"
                  value={form.heading_tag}
                  onChange={(e) => updateForm("heading_tag", e.target.value)}
                  disabled={readOnly}
                />
              </label>
            </div>
          </div>

          {!readOnly ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? "Saving…" : panel === "create" ? "Create section" : "Save section"}
              </button>
              {panel === "edit" && editingRow && !editingRow.is_system ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => onDelete(editingRow.id)}
                >
                  Delete section
                </button>
              ) : null}
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
}
