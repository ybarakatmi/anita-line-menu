import { headers } from "next/headers";

/** EEA + UK + Switzerland — the regions that need an actual consent choice. */
const CONSENT_REQUIRED_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
  "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
  "IS","LI","NO","GB","CH",
]);

/**
 * Whether this visitor should be asked for consent.
 *
 * Vercel sets `x-vercel-ip-country` at the edge. When it is missing (local dev, or
 * a proxy that strips it) we show no banner — which is safe rather than permissive,
 * because Consent Mode already denies storage for EEA/UK by region in ConsentMode.
 * A missing header therefore means those visitors stay DENIED and simply never get
 * the chance to opt in; it never silently grants anything.
 */
export async function consentRequired(): Promise<boolean> {
  try {
    const country = (await headers()).get("x-vercel-ip-country")?.toUpperCase();
    if (!country) return false;
    return CONSENT_REQUIRED_COUNTRIES.has(country);
  } catch {
    return false;
  }
}
