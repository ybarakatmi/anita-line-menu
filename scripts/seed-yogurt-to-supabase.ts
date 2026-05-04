/**
 * Inserts Plain Tart + Vanilla Soft Serve into `menu_items` when missing (same logic as migration
 * `20260503140000_yogurt_sample_items.sql`). Uses the service role so RLS does not block inserts.
 *
 * Usage (repo root):
 *   1. Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=...` (Dashboard → Settings → API).
 *   2. `npm run seed-yogurt`
 *
 * Alternative: Supabase Dashboard → SQL Editor → paste the contents of that migration file and run.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const ROWS = [
  {
    section: "yogurt" as const,
    name: "Plain Tart",
    description: "Classic tart frozen yogurt — bright, tangy, and refreshing.",
    price_display: "from $5",
    emoji: null as string | null,
    image_url: null as string | null,
    tags: [] as string[],
    badge: null as string | null,
    is_new: false,
    is_fave: false,
    is_vegan: false,
    sort_order: 0,
    is_active: true,
    promo_label: null as string | null,
    seasonal_ribbon_label: null as string | null,
  },
  {
    section: "yogurt" as const,
    name: "Vanilla Soft Serve",
    description: "Creamy Madagascar vanilla soft serve.",
    price_display: "from $5",
    emoji: null,
    image_url: null,
    tags: [],
    badge: null,
    is_new: false,
    is_fave: false,
    is_vegan: false,
    sort_order: 1,
    is_active: true,
    promo_label: null,
    seasonal_ribbon_label: null,
  },
];

async function main() {
  loadDotEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local.");
    process.exit(1);
  }
  if (!key) {
    console.error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local (Dashboard → Settings → API → service_role). Then run: npm run seed-yogurt"
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const row of ROWS) {
    const { count, error: cErr } = await supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("section", "yogurt")
      .eq("name", row.name);
    if (cErr) {
      console.error("Lookup failed:", cErr.message);
      process.exit(1);
    }
    if (count && count > 0) {
      console.log("Skip (already exists):", row.name);
      continue;
    }
    const { error } = await supabase.from("menu_items").insert(row);
    if (error) {
      console.error("Insert failed:", row.name, error.message);
      process.exit(1);
    }
    console.log("Inserted:", row.name);
  }
  console.log("Done.");
}

void main();
