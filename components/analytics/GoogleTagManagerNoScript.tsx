import { GTM_ID } from "@/lib/analytics-ids";

/**
 * Standard GTM noscript fallback — must be the first element inside <body>.
 * Server-rendered so it is present in HTML even when JavaScript is disabled.
 */
export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
