/** Attribution keys written to sessionStorage from QR UTMs on first landing. */
const STORAGE_STORE = "analytics_store_id";
const STORAGE_PLACEMENT = "analytics_placement";
const STORAGE_SESSION_STARTED = "menu_session_started";

const DIRECT = "direct";

let attributionInitialized = false;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type Attribution = {
  store_id: string;
  placement: string;
};

/**
 * Synchronous first-load init: parse URL → sessionStorage before any dataLayer push.
 * Safe to call multiple times; runs once per page load.
 */
export function initAttributionFromUrl(): void {
  if (typeof window === "undefined") return;
  if (attributionInitialized) return;
  attributionInitialized = true;

  const params = new URLSearchParams(window.location.search);
  const fromUrlStore =
    params.get("utm_campaign")?.trim() || params.get("store_id")?.trim() || "";
  const fromUrlPlacement = params.get("utm_content")?.trim() || "";

  try {
    if (fromUrlStore) sessionStorage.setItem(STORAGE_STORE, fromUrlStore);
    if (fromUrlPlacement) sessionStorage.setItem(STORAGE_PLACEMENT, fromUrlPlacement);
  } catch {
    /* private browsing */
  }
}

/** Always returns store_id + placement (never omitted). Direct visits → "direct". */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") {
    return { store_id: DIRECT, placement: DIRECT };
  }

  initAttributionFromUrl();

  try {
    return {
      store_id: sessionStorage.getItem(STORAGE_STORE)?.trim() || DIRECT,
      placement: sessionStorage.getItem(STORAGE_PLACEMENT)?.trim() || DIRECT,
    };
  } catch {
    return { store_id: DIRECT, placement: DIRECT };
  }
}

export function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  initAttributionFromUrl();
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
}

/** Push a custom event for GTM Custom Event triggers (GA4 event tags). */
export function pushAnalyticsEvent(
  event: string,
  params: Record<string, unknown> = {}
) {
  pushDataLayer({ event, ...getAttribution(), ...params });
}

/**
 * menu_session_start — exactly once per browser session.
 * Order: initAttributionFromUrl() → guard → push (UTMs available before push).
 */
export function pushMenuSessionStartOnce(): void {
  if (typeof window === "undefined") return;

  initAttributionFromUrl();

  try {
    if (sessionStorage.getItem(STORAGE_SESSION_STARTED)) return;
    sessionStorage.setItem(STORAGE_SESSION_STARTED, "1");
  } catch {
    return;
  }

  pushAnalyticsEvent("menu_session_start");
}

/** Normalize gelato filter chip keys to consistent snake_case slugs for GA4. */
const GELATO_FILTER_SLUGS: Record<string, string> = {
  all: "all",
  new: "new",
  choc: "chocolate",
  nut: "nuts",
  fruit: "fruit",
};

export function normalizeGelatoFilterValue(key: string): string {
  const k = key.trim().toLowerCase();
  return GELATO_FILTER_SLUGS[k] ?? k.replace(/\s+/g, "_");
}
