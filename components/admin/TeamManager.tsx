"use client";

import {
  createTeamMemberAction,
  listTeamMembersAction,
  removeTeamMemberAction,
  updateTeamMemberAction,
  type TeamMember,
  type TeamMemberPermissions,
} from "@/app/admin/team-actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PERM_LABELS: { key: keyof TeamMemberPermissions; label: string; description: string }[] = [
  { key: "can_edit_products", label: "Edit products", description: "Add, edit, and remove menu items" },
  { key: "can_edit_sections", label: "Edit sections", description: "Change section headings and hero background" },
  { key: "can_view_inquiries", label: "View inquiries", description: "Read contact-form submissions" },
  { key: "can_submit_tickets", label: "Submit tickets", description: "Open support tickets" },
];

const BLANK_PERMS: TeamMemberPermissions = {
  can_edit_products: false,
  can_edit_sections: false,
  can_view_inquiries: false,
  can_submit_tickets: false,
};

function PermissionCheckbox({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`admin-check-tile${checked ? " admin-check-tile--checked" : ""}${disabled ? " opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4"
      />
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{label}</p>
        <p className="admin-field-hint" style={{ margin: 0 }}>{description}</p>
      </div>
    </label>
  );
}

function AddMemberForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [perms, setPerms] = useState<TeamMemberPermissions>({ ...BLANK_PERMS });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function togglePerm(key: keyof TeamMemberPermissions) {
    setPerms((p) => ({ ...p, [key]: !p[key] }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await createTeamMemberAction({ email, password, display_name: name, permissions: perms });
      setEmail(""); setPassword(""); setName(""); setPerms({ ...BLANK_PERMS });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card admin-card-padded admin-stack-sm">
      <h3 className="admin-section-title">Add team member</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="admin-label">Display name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Email <span style={{ color: "var(--admin-error)" }}>*</span></label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="admin-input"
          />
        </div>
        <div>
          <label className="admin-label">Password <span style={{ color: "var(--admin-error)" }}>*</span></label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            className="admin-input"
          />
        </div>
      </div>

      <div>
        <p className="admin-label" style={{ marginBottom: 8 }}>Permissions</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PERM_LABELS.map(({ key, label, description }) => (
            <PermissionCheckbox
              key={key}
              label={label}
              description={description}
              checked={perms[key]}
              onChange={() => togglePerm(key)}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading || !email.trim() || !password.trim()}
        className="admin-btn admin-btn--primary disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

function MemberRow({
  member,
  onRefresh,
}: {
  member: TeamMember;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.display_name ?? "");
  const [perms, setPerms] = useState<TeamMemberPermissions>({
    can_edit_products: member.can_edit_products,
    can_edit_sections: member.can_edit_sections,
    can_view_inquiries: member.can_view_inquiries,
    can_submit_tickets: member.can_submit_tickets,
  });
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = member.role === "owner";

  async function onSave() {
    setSaving(true); setError(null);
    try {
      await updateTeamMemberAction({ userId: member.user_id, display_name: name, permissions: perms });
      setEditing(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally { setSaving(false); }
  }

  async function onRemove() {
    if (!confirm(`Remove ${member.email} from the team? They will lose access immediately.`)) return;
    setRemoving(true); setError(null);
    try {
      await removeTeamMemberAction({ userId: member.user_id });
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed.");
      setRemoving(false);
    }
  }

  return (
    <div className="admin-card overflow-hidden">
      <div className="admin-card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
              {member.display_name || member.email}
            </p>
            {isOwner && (
              <span className="admin-badge" style={{ background: "var(--admin-brand)", color: "#fff" }}>
                Owner
              </span>
            )}
          </div>
          {member.display_name && (
            <p className="admin-field-hint" style={{ margin: "2px 0 0" }}>{member.email}</p>
          )}
        </div>
        {!isOwner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setEditing((v) => !v); setError(null); }}
              className="admin-btn admin-btn--secondary"
              style={{ minHeight: 28, padding: "4px 12px", fontSize: 12 }}
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={removing}
              className="admin-btn admin-btn--danger"
              style={{ minHeight: 28, padding: "4px 12px", fontSize: 12 }}
            >
              {removing ? "Removing…" : "Remove"}
            </button>
          </div>
        )}
      </div>

      {!isOwner && !editing && (
        <div className="admin-card-body" style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 12, paddingBottom: 12 }}>
          {PERM_LABELS.map(({ key, label }) => (
            <span
              key={key}
              className={perms[key] ? "admin-badge admin-badge--success" : "admin-badge admin-badge--neutral"}
            >
              {perms[key] ? "✓" : "✗"} {label}
            </span>
          ))}
        </div>
      )}

      {editing && (
        <div className="admin-card-body" style={{ borderTop: "1px solid var(--admin-divider)" }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="admin-label">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                className="admin-input"
              />
            </div>
            {PERM_LABELS.map(({ key, label, description }) => (
              <PermissionCheckbox
                key={key}
                label={label}
                description={description}
                checked={perms[key]}
                onChange={(v) => setPerms((p) => ({ ...p, [key]: v }))}
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="admin-btn admin-btn--primary disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
      {error && !editing && <p className="px-5 pb-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}

type Props = { initialMembers: TeamMember[] };

export function TeamManager({ initialMembers }: Props) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [showAddForm, setShowAddForm] = useState(false);

  async function refresh() {
    try {
      const fresh = await listTeamMembersAction();
      setMembers(fresh);
    } catch {
      router.refresh();
    }
  }

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="admin-section-title">Team members</h2>
          <p className="admin-page-desc" style={{ marginTop: 4, fontSize: 13 }}>
            Create accounts for staff and assign exactly what they can do. Only you can add or remove members.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="admin-btn admin-btn--primary shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add member
        </button>
      </div>

      {showAddForm && (
        <AddMemberForm
          onSuccess={() => {
            setShowAddForm(false);
            void refresh();
          }}
        />
      )}

      <div className="space-y-3">
        {members.map((m) => (
          <MemberRow key={m.user_id} member={m} onRefresh={refresh} />
        ))}
        {members.length === 0 && (
          <p className="admin-card admin-card-padded admin-meta" style={{ textAlign: "center", borderStyle: "dashed" }}>
            No team members yet.
          </p>
        )}
      </div>
    </section>
  );
}
