/**
 * Tagged menu URLs for printed QR codes.
 *
 * utm_campaign → store_id and utm_content → placement are what lib/gtm.ts reads,
 * so those two drive the menu's own per-placement reporting. utm_source and
 * utm_medium do nothing for that, but without them GA4 files the scan as
 * (direct)/(none) and QR traffic never appears as a channel in acquisition.
 */

/** GA4 treats "Table Tent" and "table_tent" as two different dimension values. */
export function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function buildMenuUrl(origin: string, store: string, placement: string) {
  const url = new URL(origin);
  url.searchParams.set("utm_source", "qr");
  url.searchParams.set("utm_medium", "qr_code");
  url.searchParams.set("utm_campaign", slug(store) || "tarzana");
  url.searchParams.set("utm_content", slug(placement) || "unlabeled");
  return url.toString();
}
