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
    | "pastry_sec_the"
    | "pastry_sec_big_line1"
    | "pastry_sec_big_line2"
    | "pastry_sec_tag"
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
  const [pastrySecThe, setPastrySecThe] = useState(initial.pastry_sec_the ?? "");
  const [pastryBig1, setPastryBig1] = useState(initial.pastry_sec_big_line1 ?? "");
  const [pastryBig2, setPastryBig2] = useState(initial.pastry_sec_big_line2 ?? "");
  const [pastryTag, setPastryTag] = useState(initial.pastry_sec_tag ?? "");
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
        pastry_sec_the: pastrySecThe,
        pastry_sec_big_line1: pastryBig1,
        pastry_sec_big_line2: pastryBig2,
        pastry_sec_tag: pastryTag,
      });
      setSuccess("Saved. The public menu will refresh with these settings.");
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
        <h2 className="text-sm font-semibold text-slate-900">Homepage hero &amp; strip</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          By default the public menu uses the same sharp storefront still as anita-gelato.com (no blur). When you have
          original MP4s, upload them to{" "}
          <span className="font-medium text-slate-800">Supabase Storage</span> and paste the URLs below — then motion
          replaces the stills.
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
        Hero background video (optional MP4)
        <input
          value={heroVideoUrl}
          onChange={(e) => setHeroVideoUrl(e.target.value)}
          placeholder="Leave blank for sharp still only; or paste Supabase/public MP4 URL"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Hero still image (optional — overrides default anita-gelato.com art)
        <input
          value={heroPosterUrl}
          onChange={(e) => setHeroPosterUrl(e.target.value)}
          placeholder="https://… (PNG/JPG; also used as video poster if you add MP4)"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Separator strip video (optional MP4)
        <input
          value={separatorVideoUrl}
          onChange={(e) => setSeparatorVideoUrl(e.target.value)}
          placeholder="Leave blank for sharp still crop; or paste MP4 URL"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-sm font-semibold text-slate-900">Pastries section (public headings)</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Copy appears above the pastry carousel (after Coffee). Add or edit items under{" "}
          <span className="font-medium text-slate-800">Menu sections → Pastries</span>.
        </p>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Eyebrow (italic line)
        <input
          value={pastrySecThe}
          onChange={(e) => setPastrySecThe(e.target.value)}
          placeholder="Fresh each morning"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Title — line 1
        <input
          value={pastryBig1}
          onChange={(e) => setPastryBig1(e.target.value)}
          placeholder="Pastries"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Title — line 2
        <input
          value={pastryBig2}
          onChange={(e) => setPastryBig2(e.target.value)}
          placeholder="& More"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Tag pill (after ✦)
        <input
          value={pastryTag}
          onChange={(e) => setPastryTag(e.target.value)}
          placeholder="Croissants · Danishes · Daily specials"
          className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
      </label>

      {success && <p className="text-sm text-emerald-800">{success}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
