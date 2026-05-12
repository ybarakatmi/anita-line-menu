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
    <label className={`flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${checked ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900"
      />
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
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
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Add team member</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Display name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Password <span className="text-red-500">*</span></label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-700">Permissions</p>
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
        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {member.display_name || member.email}
            </p>
            {isOwner && (
              <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Owner
              </span>
            )}
          </div>
          {member.display_name && (
            <p className="text-xs text-slate-500">{member.email}</p>
          )}
        </div>
        {!isOwner && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setEditing((v) => !v); setError(null); }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={removing}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {removing ? "Removing…" : "Remove"}
            </button>
          </div>
        )}
      </div>

      {!isOwner && !editing && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-5 py-3">
          {PERM_LABELS.map(({ key, label }) => (
            <span
              key={key}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                perms[key]
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {perms[key] ? "✓" : "✗"} {label}
            </span>
          ))}
        </div>
      )}

      {editing && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
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
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
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
          <h2 className="text-sm font-semibold text-slate-900">Team members</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create accounts for staff and assign exactly what they can do. Only you can add or remove members.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
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
          <p className="rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center text-sm text-slate-400">
            No team members yet.
          </p>
        )}
      </div>
    </section>
  );
}
