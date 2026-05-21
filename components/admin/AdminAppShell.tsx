"use client";

import { signOutAction } from "@/app/admin/actions";
import {
  IconExternal,
  IconImage,
  IconMail,
  IconMenu,
  IconOverview,
  IconSettings,
  IconSupport,
  IconText,
} from "@/components/admin/AdminNavIcons";
import { ADMIN_MENU_SECTIONS, adminSectionHref } from "@/lib/admin-sections";
import type { ConsoleAccess } from "@/lib/console-access";
import type { MenuSection } from "@/types/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  liveCounts: Record<MenuSection, number>;
  totalCounts: Record<MenuSection, number>;
  access: ConsoleAccess;
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  viewer: "Guest",
};

function roleInitial(role: string) {
  const label = roleLabels[role] ?? "G";
  return label.charAt(0);
}

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

  function navLinkClass(href: string) {
    return `admin-nav-link${linkActive(href) ? " admin-nav-link--active" : ""}`;
  }

  const nav = (
    <nav style={{ display: "flex", flex: 1, flexDirection: "column", padding: "8px 0 16px" }}>
      <p className="admin-nav-group-label">Workspace</p>
      <Link href="/admin" className={navLinkClass("/admin")}>
        <IconOverview />
        Overview
      </Link>

      {access.canEditProducts && (
        <>
          <p className="admin-nav-group-label">Menu sections</p>
          {ADMIN_MENU_SECTIONS.map((s) => {
            const href = adminSectionHref(s.id);
            const live = liveCounts[s.id] ?? 0;
            const total = totalCounts[s.id] ?? 0;
            const title =
              live === total
                ? `${live} live item${live === 1 ? "" : "s"} on the public menu`
                : `${live} live · ${total} total`;
            return (
              <Link key={s.id} href={href} className={navLinkClass(href)} title={title}>
                <IconMenu />
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.label}
                </span>
                <span className="admin-nav-badge">
                  {live}
                  {live !== total ? <span style={{ opacity: 0.65 }}>/{total}</span> : null}
                </span>
              </Link>
            );
          })}
        </>
      )}

      {access.canEditSections && (
        <>
          <p className="admin-nav-group-label">Presentation</p>
          <Link href="/admin/hero" className={navLinkClass("/admin/hero")}>
            <IconImage />
            Hero section
          </Link>
          <Link href="/admin/sections" className={navLinkClass("/admin/sections")}>
            <IconText />
            Section headings
          </Link>
        </>
      )}

      {access.canViewInquiries && (
        <>
          <p className="admin-nav-group-label">Inquiries</p>
          <Link href="/admin/contact-submissions" className={navLinkClass("/admin/contact-submissions")}>
            <IconMail />
            Contact submissions
          </Link>
        </>
      )}

      {access.canSubmitTickets && (
        <>
          <p className="admin-nav-group-label">Support</p>
          <Link href="/admin/support" className={navLinkClass("/admin/support")}>
            <IconSupport />
            Submit a ticket
          </Link>
        </>
      )}

      <p className="admin-nav-group-label">Configuration</p>
      <Link href="/admin/settings" className={navLinkClass("/admin/settings")}>
        <IconSettings />
        <span style={{ flex: 1 }}>Settings</span>
        {access.canManageTeam ? (
          <span className="admin-nav-badge" style={{ fontSize: 10 }}>
            Team
          </span>
        ) : null}
      </Link>
    </nav>
  );

  const roleLabel = roleLabels[access.role] ?? "Guest";

  return (
    <div className="admin-shell">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(36, 36, 36, 0.4)", border: "none", cursor: "pointer" }}
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside
          className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col transition-transform lg:static lg:translate-x-0 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div
            className="admin-topbar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              flexShrink: 0,
            }}
          >
            <Link href="/admin" className="admin-sidebar-brand" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <span className="admin-sidebar-logo" aria-hidden>
                A
              </span>
              <span>
                <span className="admin-sidebar-brand-eyebrow">Anita Gelato</span>
                <span className="admin-sidebar-brand-title">Menu console</span>
              </span>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--ghost lg:hidden"
              style={{ minWidth: 32, padding: 6 }}
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            >
              ×
            </button>
          </div>

          {nav}

          <div style={{ marginTop: "auto", padding: "8px 0 12px", borderTop: "1px solid var(--admin-divider)" }}>
            <div className="admin-user-pill">
              <span className="admin-user-avatar" aria-hidden>
                {roleInitial(access.role)}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{roleLabel}</p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--admin-text-muted)" }}>
                  {access.canManageTeam ? "Full access" : "Limited access"}
                </p>
              </div>
            </div>
            <form action={signOutAction} style={{ padding: "0 8px" }}>
              <button type="submit" className="admin-btn admin-btn--secondary admin-btn--block">
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div style={{ display: "flex", minWidth: 0, flex: 1, flexDirection: "column" }}>
          <header
            className="admin-topbar sticky top-0 z-30"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "0 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                className="admin-btn admin-btn--ghost lg:hidden"
                style={{ minWidth: 32, padding: 6 }}
                aria-label="Open navigation"
                onClick={() => setMobileNavOpen(true)}
              >
                <IconMenu className="admin-nav-icon" />
              </button>
              <span className="admin-role-hint">
                {access.canManageTeam
                  ? "Owner — full access"
                  : `${roleLabel} — limited access`}
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn--secondary"
            >
              Open public menu
              <IconExternal />
            </Link>
          </header>

          <main className="admin-main flex-1">{children}</main>
        </div>
      </div>

    </div>
  );
}
