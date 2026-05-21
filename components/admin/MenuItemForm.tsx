"use client";

import { deleteMenuItemAction, saveMenuItemAction } from "@/app/admin/menu-actions";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_MENU_SECTIONS } from "@/lib/admin-sections";
import { formatAdminSyncTime } from "@/lib/format-admin-sync";
import type { MenuItemRow, MenuPriceTier, MenuSection } from "@/types/menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BLANK_TIER_TEMPLATE: MenuPriceTier[] = [
  { label: "", price: "", hint: "" },
  { label: "", price: "", hint: "" },
  { label: "", price: "", hint: "" },
  { label: "", price: "", hint: "" },
];

function tiersStateFromInitial(initial: MenuItemRow | null): MenuPriceTier[] {
  const p = initial?.price_tiers;
  if (Array.isArray(p) && p.length > 0) {
    return p.map((t) => ({
      label: t.label ?? "",
      price: t.price ?? "",
      hint: t.hint ?? "",
    }));
  }
  return BLANK_TIER_TEMPLATE.map((r) => ({ ...r }));
}

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
  const [tierRows, setTierRows] = useState<MenuPriceTier[]>(() => tiersStateFromInitial(initial));
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lastSavedLabel = !isNew ? formatAdminSyncTime(lastSavedAt) : null;

  // Re-hydrate tier editor when the loaded row changes (save + router.refresh), not on every RSC object identity.
  useEffect(() => {
    setTierRows(tiersStateFromInitial(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id, initial?.updated_at]);

  function updateTierRow(index: number, patch: Partial<MenuPriceTier>) {
    setTierRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addTierRow() {
    setTierRows((rows) => [...rows, { label: "", price: "", hint: "" }]);
  }

  function removeTierRow(index: number) {
    setTierRows((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)));
  }

  function resetTierEditor() {
    setTierRows(BLANK_TIER_TEMPLATE.map((r) => ({ ...r })));
  }

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

      const filledTiers = tierRows
        .map((r) => ({
          label: r.label.trim(),
          price: r.price.trim(),
          hint: r.hint?.trim() ? r.hint.trim() : undefined,
        }))
        .filter((r) => r.label && r.price);

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
        price_tiers: filledTiers.length > 0 ? filledTiers : null,
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
      className="admin-card admin-card-padded admin-stack-sm"
      style={{ maxWidth: "42rem" }}
    >
      <div>
        <h1 className="admin-section-title" style={{ fontSize: 20 }}>
          {isNew ? "New item" : readOnly ? "View item" : "Edit item"}
        </h1>
        <p className="admin-page-desc" style={{ marginTop: 4 }}>
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
      <label className="admin-label">
        Section
        <select
          value={section}
          disabled={readOnly}
          onChange={(e) => setSection(e.target.value as MenuSection)}
          className="admin-input mt-1.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {ADMIN_MENU_SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-label">
        Name
        <input
          required
          readOnly={readOnly}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="admin-input mt-1.5 read-only:opacity-90"
          style={{ background: "var(--admin-bg)" }}
        />
      </label>
      <label className="admin-label">
        Description
        <textarea
          readOnly={readOnly}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder={
            section === "yogurt"
              ? "Tasting notes, toppings, or dairy info — shown under the name on the public menu."
              : undefined
          }
          className="admin-input mt-1.5 read-only:opacity-90"
          style={{ background: "var(--admin-bg)" }}
        />
      </label>
      <label className="admin-label">
        {section === "yogurt" ? "Price & size options" : "Price display"}
        <input
          readOnly={readOnly}
          value={priceDisplay}
          onChange={(e) => setPriceDisplay(e.target.value)}
          placeholder={section === "yogurt" ? "e.g. Small $4 · Medium $5 · Large $6" : "from $7"}
          className="admin-input mt-1.5 read-only:opacity-90"
          style={{ background: "var(--admin-bg)" }}
        />
        {section === "yogurt" && (
          <span className="mt-1.5 block text-xs font-normal text-slate-500">
            One line is fine; guests see this under the flavor name. Use middots or commas between sizes.
          </span>
        )}
      </label>

      {readOnly ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">Tap-to-expand pricing (public menu)</p>
          {initial?.price_tiers && initial.price_tiers.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {initial.price_tiers.map((t) => (
                <li key={`${t.label}-${t.price}`}>
                  <span className="font-medium">{t.label}</span>
                  <span className="text-slate-600"> — {t.price}</span>
                  {t.hint ? (
                    <span className="mt-0.5 block text-xs text-slate-500">{t.hint}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Uses automatic size/price suggestions for this section (nothing custom saved).
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Tap-to-expand pricing</p>
              <p className="mt-1 max-w-xl text-xs text-slate-600">
                Shown when guests tap this item on the public menu. Leave every row empty to use automatic
                tiers for this section (gelato scoops, coffee sizes, etc.).
              </p>
            </div>
            <button
              type="button"
              onClick={resetTierEditor}
              className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear rows
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {tierRows.map((row, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
              >
                <label className="block text-xs font-medium text-slate-600">
                  Label
                  <input
                    value={row.label}
                    onChange={(e) => updateTierRow(i, { label: e.target.value })}
                    placeholder="Single scoop"
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600">
                  Price
                  <input
                    value={row.price}
                    onChange={(e) => updateTierRow(i, { price: e.target.value })}
                    placeholder="from $7"
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                  />
                </label>
                <label className="block text-xs font-medium text-slate-600">
                  Note (optional)
                  <input
                    value={row.hint ?? ""}
                    onChange={(e) => updateTierRow(i, { hint: e.target.value })}
                    placeholder="Classic cup or cone"
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeTierRow(i)}
                  disabled={tierRows.length <= 1}
                  className="h-9 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:mb-0.5"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTierRow}
            className="mt-3 text-xs font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
          >
            + Add tier
          </button>
        </div>
      )}

      <label className="admin-label">
        Emoji (coffee / drinks / pastries / yogurt)
        <input
          readOnly={readOnly}
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder={section === "yogurt" ? "🍦" : "☕"}
          className="admin-input mt-1.5 read-only:opacity-90"
          style={{ background: "var(--admin-bg)" }}
        />
      </label>
      <label className="admin-label">
        Badge (internal / filters — not shown on seasonal photo cards)
        <input
          readOnly={readOnly}
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder="Seasonal, Limited…"
          className="admin-input mt-1.5 read-only:opacity-90"
          style={{ background: "var(--admin-bg)" }}
        />
      </label>
      {section === "seasonal" && (
        <label className="admin-label">
          Seasonal corner ribbon
          <input
            readOnly={readOnly}
            value={seasonalRibbonLabel}
            onChange={(e) => setSeasonalRibbonLabel(e.target.value)}
            placeholder="Leave blank for auto (Limited if badge mentions limited, else Seasonal)"
            maxLength={28}
            className="admin-input mt-1.5 read-only:opacity-90"
          style={{ background: "var(--admin-bg)" }}
          />
          <span className="mt-1 block text-xs text-slate-500">
            Short label on the pink diagonal ribbon (max 28 characters). Clear the field to use automatic Seasonal/Limited from the badge field.
          </span>
        </label>
      )}
      {(section === "seasonal" || section === "gelato" || section === "sorbet") && (
        <label className="admin-label">
          Promo line (optional — shown under description on seasonal cards)
          <input
            readOnly={readOnly}
            value={promoLabel}
            onChange={(e) => setPromoLabel(e.target.value)}
            placeholder="Limited batch · Tarzana exclusive"
            className="admin-input mt-1.5 read-only:opacity-90"
          style={{ background: "var(--admin-bg)" }}
          />
        </label>
      )}
      <label className="admin-label">
        {section === "yogurt" ? "Tags (optional, internal notes)" : "Tags (gelato filters, comma-separated)"}
        <input
          readOnly={readOnly}
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder={section === "yogurt" ? "e.g. tart, vegan" : "new, choc, nut, fruit"}
          className="admin-input mt-1.5 read-only:opacity-90"
          style={{ background: "var(--admin-bg)" }}
        />
      </label>
      <label className="admin-label">
        Sort order
        <input
          type="number"
          readOnly={readOnly}
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="admin-input mt-1.5 read-only:opacity-90"
          style={{ background: "var(--admin-bg)" }}
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
      <label className="admin-label">
        Image file (optional — replaces URL)
        <input
          type="file"
          accept="image/*"
          disabled={readOnly}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1.5 w-full text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
      <label className="admin-label">
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
            className="admin-btn admin-btn--primary disabled:opacity-60"
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
          className="admin-btn admin-btn--secondary"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
