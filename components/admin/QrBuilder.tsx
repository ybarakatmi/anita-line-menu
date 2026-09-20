"use client";

import QRCode from "qrcode";
import { buildMenuUrl, slug } from "@/lib/qr-url";
import { useCallback, useEffect, useMemo, useState } from "react";

const SUGGESTIONS = [
  "counter",
  "table_tent",
  "window_decal",
  "takeout_bag",
  "sidewalk_sign",
  "receipt",
];

export function QrBuilder({ origin }: { origin: string }) {
  const [store, setStore] = useState("tarzana");
  const [placement, setPlacement] = useState("counter");
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const menuUrl = useMemo(
    () => buildMenuUrl(origin, store, placement),
    [origin, store, placement]
  );

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(menuUrl, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#5c502d", light: "#faf7f2" },
    })
      .then((url) => {
        if (!cancelled) setPngUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPngUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [menuUrl]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
    } catch {
      /* clipboard blocked — the URL is on screen to copy by hand */
    }
  }, [menuUrl]);

  const fileName = `anita-qr-${slug(store) || "store"}-${slug(placement) || "placement"}.png`;

  return (
    <section className="admin-card admin-card-padded admin-stack-sm qr-builder">
      <div className="qr-builder-fields">
        <div className="space-y-1">
          <label className="admin-label" htmlFor="qr-store">Location</label>
          <p className="admin-field-hint">
            Reports call this <code>store_id</code>. Keep it the same for every code at one shop.
          </p>
          <input
            id="qr-store"
            className="admin-input"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="tarzana"
          />
        </div>

        <div className="space-y-1">
          <label className="admin-label" htmlFor="qr-placement">Placement</label>
          <p className="admin-field-hint">
            Where this exact code lives. Reports call it <code>placement</code>.
          </p>
          <input
            id="qr-placement"
            className="admin-input"
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            placeholder="counter"
          />
        </div>
      </div>

      <div className="qr-suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className={`qr-chip${slug(placement) === s ? " qr-chip-active" : ""}`}
            onClick={() => setPlacement(s)}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="qr-result">
        {pngUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- generated data URL, nothing to optimize
          <img src={pngUrl} alt={`QR code for ${placement}`} className="qr-preview" width={200} height={200} />
        ) : (
          <div className="qr-preview qr-preview-empty" aria-hidden />
        )}

        <div className="qr-result-body">
          <code className="qr-url">{menuUrl}</code>
          <div className="qr-actions">
            <button type="button" className="admin-btn" onClick={copy}>
              {copied ? "Copied ✓" : "Copy link"}
            </button>
            {pngUrl ? (
              <a className="admin-btn admin-btn--primary" href={pngUrl} download={fileName}>
                Download PNG
              </a>
            ) : null}
          </div>
          <p className="admin-field-hint">
            Print at 1 inch or larger and test a scan before the run. Every code points at the
            same menu — only the tracking tag differs.
          </p>
        </div>
      </div>
    </section>
  );
}
