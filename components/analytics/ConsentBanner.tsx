"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "anita_consent";

type Gtag = (...args: unknown[]) => void;

/**
 * Use the global `gtag` that ConsentMode's inline script declares. It pushes a real
 * `arguments` object, which is what Google's consent handling reads — a plain array
 * pushed to dataLayer is ignored, and the update would silently do nothing.
 */
function updateConsent(granted: boolean) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  const value = granted ? "granted" : "denied";
  gtag("consent", "update", {
    analytics_storage: value,
    functionality_storage: value,
    personalization_storage: value,
  });
}

/**
 * Shown only to EEA/UK visitors who have not chosen yet — see consentRequired().
 * US foot traffic, which is nearly all of this menu's scans, never sees it.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Private browsing: ask rather than assume.
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const choose = (granted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
    } catch {
      /* choice still applies for this page view */
    }
    updateConsent(granted);
    setVisible(false);
  };

  return (
    <div className="consent-banner" role="dialog" aria-live="polite" aria-label="Cookie choices">
      <p className="consent-banner-text">
        We use cookies to see which flavors people browse. Analytics only — no ads.
      </p>
      <div className="consent-banner-actions">
        <button type="button" className="consent-btn consent-btn-secondary" onClick={() => choose(false)}>
          Decline
        </button>
        <button type="button" className="consent-btn consent-btn-primary" onClick={() => choose(true)}>
          Allow
        </button>
      </div>
    </div>
  );
}
