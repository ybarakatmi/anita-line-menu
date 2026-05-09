"use client";

import { signOutAction } from "@/app/admin/actions";
import { ADMIN_MENU_SECTIONS, adminSectionHref } from "@/lib/admin-sections";
import type { ConsoleRole } from "@/lib/console-access";
import type { MenuSection } from "@/types/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Matches what guests see on the public menu (is_active = true). */
  liveCounts: Record<MenuSection, number>;
  /** Includes hidden/staged rows (useful for managers). */
  totalCounts: Record<MenuSection, number>;
  access: { role: ConsoleRole; canEditMenu: boolean };
};

const roleLabels: Record<ConsoleRole, string> = {
  owner: "Owner",
  manager: "Manager",
  viewer: "Viewer",
};

export function AdminAppShell({ children, liveCounts, totalCounts, access }: Props) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const overviewActive = pathname === "/admin";

  function linkActive(href: string) {
    if (href === "/admin") return overviewActive;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
      <Link
        href="/admin"
        className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          overviewActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        Overview
      </Link>

      <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu sections</p>
      {ADMIN_MENU_SECTIONS.map((s) => {
        const href = adminSectionHref(s.id);
        const active = pathname.startsWith(href);
        const live = liveCounts[s.id] ?? 0;
        const total = totalCounts[s.id] ?? 0;
        const title =
          live === total
            ? `${live} live item${live === 1 ? "" : "s"} on the public menu`
            : `${live} live on the public menu · ${total} total in console (includes hidden)`;
        return (
          <Link
            key={s.id}
            href={href}
            className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>{s.label}</span>
            <span
              title={title}
              className={`rounded-md px-2 py-0.5 text-xs tabular-nums ${
                active ? "bg-white/15 text-white" : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {live}
              {live !== total ? <span className="opacity-70">/{total}</span> : null}
            </span>
          </Link>
        );
      })}

      <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Inquiries</p>
      <Link
        href="/admin/contact-submissions"
        className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          linkActive("/admin/contact-submissions") ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        Contact submissions
      </Link>

      <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Support</p>
      <Link
        href="/admin/support"
        className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          linkActive("/admin/support") ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        Submit a ticket
      </Link>

      <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Configuration</p>
      <Link
        href="/admin/settings"
        className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          linkActive("/admin/settings") ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        Settings
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform lg:static lg:translate-x-0 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4 lg:h-16">
            <Link href="/admin" className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Anita</span>
              <span className="text-sm font-semibold text-slate-900">Menu console</span>
            </Link>
            <button
              type="button"
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
          {nav}
          <div className="mt-auto border-t border-slate-100 p-3">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:h-16 lg:px-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation"
                onClick={() => setMobileNavOpen(true)}
              >
                <span className="sr-only">Menu</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-700" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {access.canEditMenu
                  ? "Store-facing menu is read-only for guests."
                  : `Signed in as ${roleLabels[access.role]} — catalog is view-only.`}
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Open public menu
            </Link>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
