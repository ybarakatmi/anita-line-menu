/**
 * Upload a local hero MP4 to Supabase Storage at the conventional path:
 *   bucket: menu-images
 *   path:   hero.mp4
 *
 * The public menu loads that URL automatically when DB hero_video_url is empty
 * (see lib/merge-site-media-env.ts).
 *
 * Usage:
 *   1. Download hero.mp4 from anita-gelato.com in a browser (Save As) — server-side curl is often blocked.
 *   2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Dashboard → Settings → API; never commit it).
 *   3. From repo root:
 *        npm run upload-hero -- ~/Downloads/hero.mp4
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { HERO_STORAGE_OBJECT_PATH } from "../lib/merge-site-media-env";

const BUCKET = "menu-images";

function loadDotEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
}

async function main() {
  loadDotEnvLocal();

  const filePath = resolve(process.argv[2] || "hero.mp4");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add both to .env.local and retry."
    );
    process.exit(1);
  }

  let body: Buffer;
  try {
    body = readFileSync(filePath);
  } catch (e) {
    console.error(`Cannot read file: ${filePath}`, e);
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(HERO_STORAGE_OBJECT_PATH, body, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (upErr) {
    console.error("Upload failed:", upErr.message);
    process.exit(1);
  }

  const publicUrl = `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${HERO_STORAGE_OBJECT_PATH}`;
  console.log("Uploaded OK:", publicUrl);
  console.log("Redeploy is not required — refresh the public menu after CDN propagation (a few seconds).");
}

void main();
