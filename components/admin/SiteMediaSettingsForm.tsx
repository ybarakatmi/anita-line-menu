"use client";

import { saveSiteMediaSettingsAction } from "@/app/admin/site-settings-actions";
import type { SiteSettingsRow } from "@/types/menu";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initial: Pick<
    SiteSettingsRow,
    | "hero_eyebrow"
    | "hero_secondary_label"
    | "hero_secondary_href"
    | "hero_video_url"
    | "hero_video_poster_url"
    | "separator_video_url"
  >;
};

export function SiteMediaSettingsForm({ initial }: Props) {
  const router = useRouter();
  const [heroEyebrow, setHeroEyebrow] = useState(initial.hero_eyebrow ?? "");
  const [heroSecondaryLabel, setHeroSecondaryLabel] = useState(initial.hero_secondary_label ?? "");
  const [heroSecondaryHref, setHeroSecondaryHref] = useState(initial.hero_secondary_href ?? "");
  const [heroVideoUrl, setHeroVideoUrl] = useState(initial.hero_video_url ?? "");
  const [heroPosterUrl, setHeroPosterUrl] = useState(initial.hero_video_poster_url ?? "");
  const [separatorVideoUrl, setSeparatorVideoUrl] = useState(initial.separator_video_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await saveSiteMediaSettingsAction({
        hero_eyebrow: heroEyebrow,
        hero_secondary_label: heroSecondaryLabel,
        hero_secondary_href: heroSecondaryHref,
        hero_video_url: heroVideoUrl,
        hero_video_poster_url: heroPosterUrl,
        separator_video_url: separatorVideoUrl,
      });
      setSuccess("Saved. The public menu will use these URLs on the next load.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(ev) => void onSubmit(ev)}
      className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
    >
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Homepage video &amp; hero</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Videos linked directly from some websites return{" "}
          <span className="font-medium text-slate-800">403 Forbidden</span> when played from Vercel, so you may only see
          the poster image. Upload MP4s to{" "}
          <span className="font-medium text-slate-800">Supabase Storage</span> (public bucket) or another host that
          allows embedding, then paste the HTTPS URLs here.
        </p>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Hero eyebrow line
        <input
          value={heroEyebrow}
          onChange={(e) => setHeroEyebrow(e.target.value)}
          placeholder="Tarzana · Los Angeles"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Hero secondary button label
        <input
          value={heroSecondaryLabel}
          onChange={(e) => setHeroSecondaryLabel(e.target.value)}
          placeholder="Visit Tarzana"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <span className="mt-1 block text-xs text-slate-500">
          Leave blank to use the default single-location label on the public site.
        </span>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Hero secondary button link
        <input
          value={heroSecondaryHref}
          onChange={(e) => setHeroSecondaryHref(e.target.value)}
          placeholder="https://maps.google.com/…"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <span className="mt-1 block text-xs text-slate-500">
          Maps or your location page. Leave blank for the default Google Maps search for this shop.
        </span>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Hero background video (MP4 URL)
        <input
          value={heroVideoUrl}
          onChange={(e) => setHeroVideoUrl(e.target.value)}
          placeholder="Leave blank for built-in /videos/hero.mp4 (brand art), or paste your MP4 URL"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Hero poster image (shown until video plays — optional)
        <input
          value={heroPosterUrl}
          onChange={(e) => setHeroPosterUrl(e.target.value)}
          placeholder="https://…"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Separator strip video (MP4 URL)
        <input
          value={separatorVideoUrl}
          onChange={(e) => setSeparatorVideoUrl(e.target.value)}
          placeholder="Leave blank for built-in /videos/separator.mp4, or paste your MP4 URL"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      {success && <p className="text-sm text-emerald-800">{success}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save media URLs"}
      </button>
    </form>
  );
}
