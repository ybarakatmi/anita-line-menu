import { headers } from "next/headers";

/**
 * Canonical origin for absolute URLs (Open Graph, iMessage previews, etc.).
 * Prefer NEXT_PUBLIC_SITE_URL in production so crawlers always match your public domain.
 */
export async function resolvePublicOrigin(): Promise<string | null> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return null;
    const forwardedProto = h.get("x-forwarded-proto");
    const proto =
      forwardedProto ??
      (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return null;
  }
}

export function toAbsoluteMediaUrl(origin: string, pathOrUrl: string): string {
  const s = pathOrUrl.trim();
  if (!s) return origin;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  return `${origin}${s.startsWith("/") ? s : `/${s}`}`;
}
