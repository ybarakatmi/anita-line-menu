/**
 * Pricing logic audit — run: npx tsx scripts/audit-pricing.ts
 */
import { getPriceTiersForItem } from "../lib/menu-item-detail";
import type { MenuItemRow, MenuSection } from "../types/menu";

function item(
  section: MenuSection,
  overrides: Partial<MenuItemRow> = {}
): MenuItemRow {
  return {
    id: "test",
    section,
    name: "Test",
    description: null,
    price_display: null,
    emoji: null,
    image_url: null,
    tags: [],
    badge: null,
    is_new: false,
    is_fave: false,
    is_vegan: false,
    sort_order: 0,
    is_active: true,
    promo_label: null,
    seasonal_ribbon_label: null,
    ...overrides,
  };
}

function assert(name: string, condition: boolean, detail?: string) {
  if (!condition) {
    console.error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
    process.exitCode = 1;
  } else {
    console.log(`ok: ${name}`);
  }
}

// Custom tiers — only saved rows
const customOne = getPriceTiersForItem(
  item("gelato", { price_tiers: [{ label: "Single scoop", price: "$5" }], price_display: "from $99" })
);
assert("custom gelato shows one tier only", customOne.length === 1 && customOne[0].price === "$5");
assert("custom ignores price_display on expand", customOne[0].price !== "from $99");

// Auto gelato — price_display updates single scoop line
const gelatoAuto = getPriceTiersForItem(item("gelato", { price_display: "$8" }));
assert("auto gelato has 4 tiers", gelatoAuto.length === 4);
assert("auto gelato single scoop uses price_display", gelatoAuto[1].price === "$8");

const gelatoFrom = getPriceTiersForItem(item("gelato", { price_display: "from $9" }));
assert("auto gelato works with 'from' prefix", gelatoFrom[1].price === "from $9");

// Auto yogurt — price_display drives expand panel
const yogurtAuto = getPriceTiersForItem(item("yogurt", { price_display: "Small $4 · Large $8" }));
assert("auto yogurt uses price_display in expand", yogurtAuto.length === 1 && yogurtAuto[0].price.includes("$4"));

// Coffee / pastries / drinks
const coffee = getPriceTiersForItem(item("coffee", { price_display: "$4.00" }));
assert("auto coffee prep row uses price_display", coffee[0].price === "$4.00");

const pastry = getPriceTiersForItem(item("pastries", { price_display: "$5.50" }));
assert("auto pastry uses price_display", pastry[0].price === "$5.50");

const drink = getPriceTiersForItem(item("drinks", { price_display: "$3.00" }));
assert("auto drink uses price_display", drink[0].price === "$3.00");

// Empty custom
const emptyCustom = getPriceTiersForItem(item("gelato", { price_tiers: [] }));
assert("empty custom array shows no tiers", emptyCustom.length === 0);

console.log(process.exitCode === 1 ? "\nSome checks failed." : "\nAll pricing checks passed.");
