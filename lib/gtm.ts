/** Keys used by GTM data layer variables (dlv_*). */
export type AnalyticsContext = {
  store_id?: string;
  placement?: string;
};

const STORAGE_STORE = "analytics_store_id";
const STORAGE_PLACEMENT = "analytics_placement";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

/** Persist QR UTMs for the session so later events keep store attribution. */
export function getAnalyticsContext(): AnalyticsContext {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  let store_id = params.get("utm_campaign")?.trim() || params.get("store_id")?.trim() || "";
  let placement = params.get("utm_content")?.trim() || "";

  try {
    if (!store_id) store_id = sessionStorage.getItem(STORAGE_STORE) ?? "";
    else sessionStorage.setItem(STORAGE_STORE, store_id);

    if (!placement) placement = sessionStorage.getItem(STORAGE_PLACEMENT) ?? "";
    else sessionStorage.setItem(STORAGE_PLACEMENT, placement);
  } catch {
    /* private browsing */
  }

  const ctx: AnalyticsContext = {};
  if (store_id) ctx.store_id = store_id;
  if (placement) ctx.placement = placement;
  return ctx;
}

/** Push a custom event for GTM Custom Event triggers (GA4 event tags). */
export function pushAnalyticsEvent(
  event: string,
  params: Record<string, unknown> = {}
) {
  pushDataLayer({ event, ...getAnalyticsContext(), ...params });
}
