"use client";

import { clearHeroBgImageAction, saveHeroSettingsAction } from "@/app/admin/hero-actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Props = {
  currentBgImageUrl: string | null;
  currentEyebrow: string | null;
  currentSecondaryLabel: string | null;
  currentSecondaryHref: string | null;
};

export function HeroEditor({
  currentBgImageUrl,
  currentEyebrow,
  currentSecondaryLabel,
  currentSecondaryHref,
}: Props) {
  const router = useRouter();

  const [bgImageUrl, setBgImageUrl] = useState(currentBgImageUrl ?? "");
  const [eyebrow, setEyebrow] = useState(currentEyebrow ?? "");
  const [secondaryLabel, setSecondaryLabel] = useState(currentSecondaryLabel ?? "");
  const [secondaryHref, setSecondaryHref] = useState(currentSecondaryHref ?? "");

  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(currentBgImageUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const {
      data: { publicUrl },
    } = supabase.storage.from("menu-images").getPublicUrl(path);
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
        hero_eyebrow: eyebrow.trim() || null,
        hero_secondary_label: secondaryLabel.trim() || null,
        hero_secondary_href: secondaryHref.trim() || null,
      });
      setFile(null);
      setBgImageUrl(finalUrl ?? "");
      setPreviewSrc(finalUrl);
      setSuccess("Hero settings saved. Changes are live on the public menu.");
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
      setSuccess("Hero background cleared. The default video / gradient will show.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setClearing(false);
    }
  }

  const busy = uploading || saving || clearing;

  return (
    <form onSubmit={onSave} className="space-y-8">
      {/* Background image section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-slate-900">Background image</h2>
        <p className="mb-5 text-sm text-slate-500">
          Upload a photo or paste a URL. This image replaces the default video background on the
          public menu. Recommended: portrait orientation, at least 430 × 860 px.
        </p>

        {/* Preview */}
        <div
          className={`relative mb-5 flex h-64 w-full max-w-xs overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
            isDragging
              ? "border-slate-400 bg-slate-50"
              : previewSrc
                ? "border-slate-200 bg-slate-50"
                : "border-slate-300 bg-slate-50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFileChange(dropped);
          }}
        >
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt="Hero background preview"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              <span className="text-xs">Drop image here</span>
            </div>
          )}
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
              <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow">
                Drop to upload
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {file ? "Change file" : "Choose image"}
          </button>
          {file && (
            <span className="flex items-center text-sm text-slate-600">
              {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Or paste an image URL
          </label>
          <input
            type="url"
            value={bgImageUrl}
            onChange={(e) => {
              setBgImageUrl(e.target.value);
              setFile(null);
              setPreviewSrc(e.target.value || null);
            }}
            placeholder="https://…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {previewSrc && (
          <div className="mt-3 flex justify-start">
            <button
              type="button"
              onClick={onClear}
              disabled={busy}
              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {clearing ? "Clearing…" : "Remove background image"}
            </button>
          </div>
        )}
      </div>

      {/* Hero text fields */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-slate-900">Hero text &amp; links</h2>
        <p className="mb-5 text-sm text-slate-500">
          These fields appear as copy on the hero section of the public menu.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Eyebrow line{" "}
              <span className="font-normal text-slate-400">(small text above the brand name)</span>
            </label>
            <input
              type="text"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="Tarzana · Los Angeles"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Secondary button label
              </label>
              <input
                type="text"
                value={secondaryLabel}
                onChange={(e) => setSecondaryLabel(e.target.value)}
                placeholder="Visit Tarzana"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Secondary button URL
              </label>
              <input
                type="url"
                value={secondaryHref}
                onChange={(e) => setSecondaryHref(e.target.value)}
                placeholder="https://maps.google.com/…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {uploading ? "Uploading…" : saving ? "Saving…" : "Save hero settings"}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Preview public menu ↗
        </a>
      </div>
    </form>
  );
}
