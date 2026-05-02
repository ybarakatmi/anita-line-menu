import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { SiteMediaSettingsForm } from "@/components/admin/SiteMediaSettingsForm";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettingsRow } from "@/types/menu";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: settingsRow, error: settingsError } = await supabase
    .from("site_settings")
    .select(
      "hero_eyebrow, hero_secondary_label, hero_secondary_href, hero_video_url, hero_video_poster_url, separator_video_url, pastry_sec_the, pastry_sec_big_line1, pastry_sec_big_line2, pastry_sec_tag"
    )
    .eq("id", 1)
    .maybeSingle();

  const settings = settingsRow as Pick<
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
  > | null;

  return (
    <div className="space-y-10">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <AdminBreadcrumbs items={[{ label: "Overview", href: "/admin" }, { label: "Settings" }]} />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Configuration</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Signed-in operators can edit the catalog from the menu console. Public-facing marketing lines stay managed
          separately so the menu stays on-brand.
        </p>
      </div>

      {settingsError && (
        <div className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Could not load site settings: {settingsError.message}
        </div>
      )}
      {!settingsError && settings && <SiteMediaSettingsForm initial={settings} />}

      <section className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <h2 className="text-sm font-semibold text-slate-900">Your session</h2>
        <p className="text-sm text-slate-600">
          Signed in as <span className="font-medium text-slate-800">{user.email}</span>
        </p>
        <p className="text-sm leading-relaxed text-slate-600">
          To use a different account, sign out from the sidebar, then sign in again on the login page.
        </p>
        <Link
          href="/admin"
          className="inline-flex text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4"
        >
          Back to overview
        </Link>
      </section>
    </div>
  );
}
