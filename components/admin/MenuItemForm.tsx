"use client";

import { deleteMenuItemAction, saveMenuItemAction } from "@/app/admin/menu-actions";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_MENU_SECTIONS } from "@/lib/admin-sections";
import { formatAdminSyncTime } from "@/lib/format-admin-sync";
import type { MenuItemRow, MenuSection } from "@/types/menu";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { initial: MenuItemRow | null };

export function MenuItemForm({
  initial,
  initialSection,
  returnHref = "/admin",
  lastSavedAt,
  navigateAfterSave = true,
  readOnly = false,
}: Props & {
  initialSection?: MenuSection;
  returnHref?: string;
  lastSavedAt?: string | null;
  /** If false, stay on the edit screen and refresh server data (better UX for edits). */
  navigateAfterSave?: boolean;
  /** View catalog details without save/delete (viewer role). */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const isNew = !initial;
  const [section, setSection] = useState<MenuSection>(initial?.section ?? initialSection ?? "gelato");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceDisplay, setPriceDisplay] = useState(initial?.price_display ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [tagsRaw, setTagsRaw] = useState((initial?.tags ?? []).join(", "));
  const [isNewFlag, setIsNewFlag] = useState(initial?.is_new ?? false);
  const [isFave, setIsFave] = useState(initial?.is_fave ?? false);
  const [isVegan, setIsVegan] = useState(initial?.is_vegan ?? false);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [promoLabel, setPromoLabel] = useState(initial?.promo_label ?? "");
  const [seasonalRibbonLabel, setSeasonalRibbonLabel] = useState(initial?.seasonal_ribbon_label ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lastSavedLabel = !isNew ? formatAdminSyncTime(lastSavedAt) : null;

  async function uploadIfNeeded(): Promise<string | null> {
    if (!file) return imageUrl || null;
    const supabase = createClient();
    const path = `items/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("menu-images").upload(path, file, {
      upsert: true,
    });
    if (upErr) throw upErr;
    const {
      data: { publicUrl },
    } = supabase.storage.from("menu-images").getPublicUrl(path);
    return publicUrl;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const finalImage = await uploadIfNeeded();

      await saveMenuItemAction({
        id: initial?.id,
        section,
        name,
        description: description || null,
        price_display: priceDisplay || null,
        emoji: emoji || null,
        image_url: finalImage,
        tagsRaw,
        badge: badge || null,
        is_new: isNewFlag,
        is_fave: isFave,
        is_vegan: isVegan,
        is_active: isActive,
        sort_order: sortOrder,
        promo_label: promoLabel.trim() ? promoLabel.trim() : null,
        seasonal_ribbon_label:
          section === "seasonal" && seasonalRibbonLabel.trim()
            ? seasonalRibbonLabel.trim().slice(0, 28)
            : null,
      });

      setSuccess("Saved successfully.");
      if (navigateAfterSave) {
        router.push(returnHref);
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (readOnly || !initial || !confirm("Delete this item?")) return;
    setLoading(true);
    try {
      await deleteMenuItemAction({ id: initial.id, section: initial.section });
      router.push(returnHref);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          {isNew ? "New item" : readOnly ? "View item" : "Edit item"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {readOnly
            ? "You can review how this item appears in the console. Changes require a manager or owner."
            : "Updates apply to the public menu after save. Uploads go to the secure media bucket for this project."}
        </p>
        {readOnly && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            View-only access — editing is disabled for your role.
          </p>
        )}
        {lastSavedLabel && (
          <p className="mt-2 text-xs text-slate-500">
            Last saved in database: <span className="font-medium text-slate-700">{lastSavedLabel}</span>
          </p>
        )}
        {isNew && (
          <p className="mt-2 text-xs text-amber-800/90">
            Draft — not on the public menu until you save with <span className="font-medium">Active</span> turned on.
          </p>
        )}
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Section
        <select
          value={section}
          disabled={readOnly}
          onChange={(e) => setSection(e.target.value as MenuSection)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
        >
          {ADMIN_MENU_SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Name
        <input
          required
          readOnly={readOnly}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          readOnly={readOnly}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Price display
        <input
          readOnly={readOnly}
          value={priceDisplay}
          onChange={(e) => setPriceDisplay(e.target.value)}
          placeholder="from $7"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Emoji (coffee / drinks / pastries)
        <input
          readOnly={readOnly}
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="☕"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Badge (internal / filters — not shown on seasonal photo cards)
        <input
          readOnly={readOnly}
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder="Seasonal, Limited…"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
        />
      </label>
      {section === "seasonal" && (
        <label className="block text-sm font-medium text-slate-700">
          Seasonal corner ribbon
          <input
            readOnly={readOnly}
            value={seasonalRibbonLabel}
            onChange={(e) => setSeasonalRibbonLabel(e.target.value)}
            placeholder="Leave blank for auto (Limited if badge mentions limited, else Seasonal)"
            maxLength={28}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
          />
          <span className="mt-1 block text-xs text-slate-500">
            Short label on the pink diagonal ribbon (max 28 characters). Clear the field to use automatic Seasonal/Limited from the badge field.
          </span>
        </label>
      )}
      {(section === "seasonal" || section === "gelato" || section === "sorbet") && (
        <label className="block text-sm font-medium text-slate-700">
          Promo line (optional — shown under description on seasonal cards)
          <input
            readOnly={readOnly}
            value={promoLabel}
            onChange={(e) => setPromoLabel(e.target.value)}
            placeholder="Limited batch · Tarzana exclusive"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
          />
        </label>
      )}
      <label className="block text-sm font-medium text-slate-700">
        Tags (gelato filters, comma-separated)
        <input
          readOnly={readOnly}
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="new, choc, nut, fruit"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Sort order
        <input
          type="number"
          readOnly={readOnly}
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          disabled={readOnly}
          checked={isNewFlag}
          onChange={(e) => setIsNewFlag(e.target.checked)}
        />
        New
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" disabled={readOnly} checked={isFave} onChange={(e) => setIsFave(e.target.checked)} />
        Fan favorite
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" disabled={readOnly} checked={isVegan} onChange={(e) => setIsVegan(e.target.checked)} />
        Vegan
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" disabled={readOnly} checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Active (visible on public menu)
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Image file (optional — replaces URL)
        <input
          type="file"
          accept="image/*"
          disabled={readOnly}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1.5 w-full text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Image URL (if no file)
        <input
          readOnly={readOnly}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 read-only:bg-slate-50 read-only:opacity-90"
        />
      </label>
      {success && <p className="text-sm text-emerald-800">{success}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
        {!readOnly && (
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        )}
        {!readOnly && !isNew && (
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={loading}
            className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Delete
          </button>
        )}
        <a
          href={returnHref}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
