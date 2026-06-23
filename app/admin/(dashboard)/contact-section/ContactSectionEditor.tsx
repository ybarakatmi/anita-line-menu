"use client";

import {
  clearContactSectionImageAction,
  saveContactSectionImageAction,
} from "@/app/admin/contact-section-actions";
import { AdminCard, AdminField } from "@/components/admin/AdminUi";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Props = {
  currentImageUrl: string | null;
};

export function ContactSectionEditor({ currentImageUrl }: Props) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(currentImageUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(currentImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImageUrl("");
  }

  async function uploadFile(): Promise<string> {
    if (!file) return imageUrl;
    setUploading(true);
    const supabase = createClient();
    const safeName = file.name.replace(/[^\w.-]+/g, "_");
    const path = `footer/${Date.now()}-${safeName}`;
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
      const finalUrl = file ? await uploadFile() : imageUrl.trim() || null;
      await saveContactSectionImageAction({ footer_contact_image_url: finalUrl });
      setFile(null);
      setImageUrl(finalUrl ?? "");
      setPreviewSrc(finalUrl);
      setSuccess("Contact section photo saved. Changes are live on the public menu.");
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
      await clearContactSectionImageAction();
      setFile(null);
      setImageUrl("");
      setPreviewSrc(null);
      setSuccess("Contact section photo removed from the public menu.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setClearing(false);
    }
  }

  const busy = uploading || saving || clearing;

  return (
    <form onSubmit={onSave} className="admin-stack">
      <AdminCard
        title="Footer contact photo"
        description="Upload a photo shown below the SEND button in the CONTACT US footer. Recommended: portrait, at least 640 × 400 px."
      >
        <div
          className={`relative flex h-72 w-full max-w-sm overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
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
            handleFileChange(e.dataTransfer.files[0] ?? null);
          }}
        >
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt="Footer contact photo preview"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
              <svg
                width="36"
                height="36"
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
              <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium shadow">
                Drop to upload
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="admin-btn admin-btn--secondary"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {file ? "Change file" : "Choose image"}
          </button>
          {file && (
            <span className="text-sm text-slate-600">
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

        <AdminField label="Or paste an image URL">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => {
              const v = e.target.value;
              setImageUrl(v);
              setFile(null);
              setPreviewSrc(v || null);
            }}
            placeholder="https://…"
            className="admin-input"
          />
        </AdminField>

        {previewSrc && (
          <button
            type="button"
            onClick={onClear}
            disabled={busy}
            className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {clearing ? "Removing…" : "Remove footer photo"}
          </button>
        )}
      </AdminCard>

      {error && <div className="admin-message admin-message--error">{error}</div>}
      {success && <div className="admin-message admin-message--success">{success}</div>}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button type="submit" disabled={busy} className="admin-btn admin-btn--primary admin-btn--lg">
          {uploading ? "Uploading image…" : saving ? "Saving…" : "Save contact section"}
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer" className="admin-link">
          Preview public menu ↗
        </a>
      </div>
    </form>
  );
}
