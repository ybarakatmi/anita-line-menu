"use client";

import { clearHeroBgImageAction, saveHeroSettingsAction } from "@/app/admin/hero-actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Props = {
  currentBgImageUrl: string | null;
  currentEyebrow: string | null;
  currentBrandLine1: string | null;
  currentBrandLine2: string | null;
  currentSubtitle: string | null;
  currentTag1: string | null;
  currentTag2: string | null;
  currentTag3: string | null;
  currentPrimaryLabel: string | null;
  currentSecondaryLabel: string | null;
  currentSecondaryHref: string | null;
};

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">
        {label}
        {hint && <span className="ml-1 font-normal text-slate-400">({hint})</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function HeroEditor({
  currentBgImageUrl,
  currentEyebrow,
  currentBrandLine1,
  currentBrandLine2,
  currentSubtitle,
  currentTag1,
  currentTag2,
  currentTag3,
  currentPrimaryLabel,
  currentSecondaryLabel,
  currentSecondaryHref,
}: Props) {
  const router = useRouter();

  // background image
  const [bgImageUrl, setBgImageUrl] = useState(currentBgImageUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(currentBgImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // copy fields
  const [eyebrow, setEyebrow] = useState(currentEyebrow ?? "");
  const [brandLine1, setBrandLine1] = useState(currentBrandLine1 ?? "");
  const [brandLine2, setBrandLine2] = useState(currentBrandLine2 ?? "");
  const [subtitle, setSubtitle] = useState(currentSubtitle ?? "");
  const [tag1, setTag1] = useState(currentTag1 ?? "");
  const [tag2, setTag2] = useState(currentTag2 ?? "");
  const [tag3, setTag3] = useState(currentTag3 ?? "");
  const [primaryLabel, setPrimaryLabel] = useState(currentPrimaryLabel ?? "");
  const [secondaryLabel, setSecondaryLabel] = useState(currentSecondaryLabel ?? "");
  const [secondaryHref, setSecondaryHref] = useState(currentSecondaryHref ?? "");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleFileChange(selected: File | null) {
    if (!selected) return;
    setFile(selected);
    setError(null);
    setSuccess(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewSrc(e.target?.result as string);
    reader.readAsDataURL(selected);
    setBgImageUrl("");
  }

  async function uploadFile(): Promise<string> {
    if (!file) return bgImageUrl;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `hero/hero-bg-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("menu-images").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    setUploading(false);
    if (upErr) throw new Error(upErr.message);
    const { data: { publicUrl } } = supabase.storage.from("menu-images").getPublicUrl(path);
    return publicUrl;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const finalUrl = file ? await uploadFile() : bgImageUrl.trim() || null;
      await saveHeroSettingsAction({
        hero_bg_image_url: finalUrl || null,
        hero_eyebrow: eyebrow || null,
        hero_brand_line1: brandLine1 || null,
        hero_brand_line2: brandLine2 || null,
        hero_subtitle: subtitle || null,
        hero_tag1: tag1 || null,
        hero_tag2: tag2 || null,
        hero_tag3: tag3 || null,
        hero_primary_label: primaryLabel || null,
        hero_secondary_label: secondaryLabel || null,
        hero_secondary_href: secondaryHref || null,
      });
      setFile(null);
      setBgImageUrl(finalUrl ?? "");
      setPreviewSrc(finalUrl);
      setSuccess("Hero saved. Changes are live on the public menu.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setError(null);
    setSuccess(null);
    setClearing(true);
    try {
      await clearHeroBgImageAction();
      setFile(null);
      setBgImageUrl("");
      setPreviewSrc(null);
      setSuccess("Background image cleared. The default video will show.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setClearing(false);
    }
  }

  const busy = uploading || saving || clearing;

  return (
    <form onSubmit={onSave} className="space-y-6">

      {/* ── Background image ───────────────────────────────── */}
      <SectionCard
        title="Background image"
        description="Upload a photo or paste a URL. Replaces the default video behind the hero. Recommended: portrait, at least 430 × 860 px."
      >
        <div
          className={`relative flex h-56 w-full max-w-xs overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
            isDragging ? "border-slate-400 bg-slate-50" : previewSrc ? "border-slate-200 bg-slate-50" : "border-slate-300 bg-slate-50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
        >
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="Hero background preview" className="h-full w-full object-cover object-center" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
              </svg>
              <span className="text-xs">Drop image here</span>
            </div>
          )}
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
              <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium shadow">Drop to upload</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {file ? "Change file" : "Choose image"}
          </button>
          {file && <span className="text-sm text-slate-600">{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="sr-only"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />

        <Field
          label="Or paste an image URL"
          value={bgImageUrl}
          onChange={(v) => { setBgImageUrl(v); setFile(null); setPreviewSrc(v || null); }}
          placeholder="https://…"
          type="url"
        />

        {previewSrc && (
          <button type="button" onClick={onClear} disabled={busy}
            className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50">
            {clearing ? "Clearing…" : "Remove background image"}
          </button>
        )}
      </SectionCard>

      {/* ── Brand name ─────────────────────────────────────── */}
      <SectionCard
        title="Brand name"
        description='The large display text in the centre of the hero. Split across two lines — e.g. "LA MAMMA" and "DEL GELATO".'
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Line 1" value={brandLine1} onChange={setBrandLine1} placeholder="LA MAMMA" />
          <Field label="Line 2" value={brandLine2} onChange={setBrandLine2} placeholder="DEL GELATO" />
        </div>

        {/* live preview */}
        <div className="rounded-lg bg-slate-900 px-6 py-5 text-center">
          <p className="font-serif text-3xl font-bold leading-tight tracking-tight text-white">
            {brandLine1 || "LA MAMMA"}
          </p>
          <p className="font-serif text-3xl font-bold leading-tight tracking-tight text-white">
            {brandLine2 || "DEL GELATO"}
          </p>
        </div>
      </SectionCard>

      {/* ── Subtitle + eyebrow ─────────────────────────────── */}
      <SectionCard
        title="Subtitle &amp; eyebrow"
        description="The italic name below the brand and the small location line at the top."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Italic subtitle" hint='shows as italic below brand' value={subtitle} onChange={setSubtitle} placeholder="Anita Gelato" />
          <Field label="Eyebrow" hint="top of hero" value={eyebrow} onChange={setEyebrow} placeholder="Tarzana · Los Angeles" />
        </div>
      </SectionCard>

      {/* ── Tag pills ──────────────────────────────────────── */}
      <SectionCard
        title="Category pills"
        description='The three small pill labels under the subtitle — e.g. "Gelato", "Yogurt", "Coffee".'
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Pill 1" value={tag1} onChange={setTag1} placeholder="Gelato" />
          <Field label="Pill 2" value={tag2} onChange={setTag2} placeholder="Yogurt" />
          <Field label="Pill 3" value={tag3} onChange={setTag3} placeholder="Coffee" />
        </div>

        {/* live preview */}
        <div className="flex flex-wrap gap-2">
          {[tag1 || "Gelato", tag2 || "Yogurt", tag3 || "Coffee"].map((t) => (
            <span key={t} className="rounded border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
              {t}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* ── Buttons ────────────────────────────────────────── */}
      <SectionCard
        title="Hero buttons"
        description='The two call-to-action buttons at the bottom of the hero. "View Flavors" scrolls down the page; "Visit Tarzana" links to an external URL.'
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Primary button label" hint="dark left button" value={primaryLabel} onChange={setPrimaryLabel} placeholder="VIEW FLAVORS" />
          <Field label="Secondary button label" hint="outline right button" value={secondaryLabel} onChange={setSecondaryLabel} placeholder="VISIT TARZANA" />
        </div>
        <Field label="Secondary button URL" hint="where the outline button links" value={secondaryHref} onChange={setSecondaryHref} placeholder="https://maps.google.com/…" type="url" />

        {/* live preview */}
        <div className="flex flex-wrap gap-3">
          <span className="rounded bg-slate-800 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white">
            {primaryLabel || "VIEW FLAVORS"}
          </span>
          <span className="rounded border border-slate-800 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-slate-800">
            {secondaryLabel || "VISIT TARZANA"}
          </span>
        </div>
      </SectionCard>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
          {uploading ? "Uploading image…" : saving ? "Saving…" : "Save hero"}
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Preview public menu ↗
        </a>
      </div>
    </form>
  );
}
