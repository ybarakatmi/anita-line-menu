import type { MenuItemRow, MenuPriceTier, MenuSection } from "@/types/menu";

export type PriceTier = MenuPriceTier;

const FROZEN_SECTIONS: MenuSection[] = ["gelato", "sorbet", "yogurt"];

/** Scoop / cup ladder — aligns with existing “from $7” gelato line on the menu. */
const GELATO_STYLE_TIERS: PriceTier[] = [
  { label: "Kid scoop", price: "$4.50", hint: "Smaller portion" },
  { label: "Single scoop", price: "from $7", hint: "Classic cup or cone" },
  { label: "Double scoop", price: "from $11", hint: "Two flavors" },
  { label: "Pint to go", price: "from $18", hint: "Take home" },
];

const YOGURT_TIERS: PriceTier[] = [
  { label: "Small", price: "from $5", hint: "Swirl cup" },
  { label: "Regular", price: "from $7", hint: "More room for toppings" },
  { label: "Large", price: "from $9", hint: "Shareable" },
];

const COFFEE_TIERS: PriceTier[] = [
  { label: "Short · hot", price: "from $3.50", hint: "Espresso-forward" },
  { label: "12 oz · hot or iced", price: "from $5", hint: "Latte, cappuccino, etc." },
  { label: "16 oz · iced", price: "from $5.50", hint: "Extra refresh" },
];

const PASTRY_NOTE =
  "Baked fresh · availability may vary by day. Add a coffee for the full ritual.";

const DRINK_NOTE = "Chilled & sparkling options — perfect with a scoop.";

function isFrozenStyleSection(section: MenuSection): boolean {
  return (
    FROZEN_SECTIONS.includes(section) ||
    section === "bestsellers" ||
    section === "seasonal"
  );
}

function tiersFromDatabase(raw: MenuItemRow["price_tiers"]): PriceTier[] | null {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return null;
  const out: PriceTier[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const label = String((row as MenuPriceTier).label ?? "").trim();
    const price = String((row as MenuPriceTier).price ?? "").trim();
    if (!label || !price) continue;
    const hintRaw = (row as MenuPriceTier).hint;
    const hint = hintRaw != null && String(hintRaw).trim() ? String(hintRaw).trim() : undefined;
    out.push({ label, price, hint });
  }
  return out.length ? out : null;
}

export function getPriceTiersForItem(item: MenuItemRow): PriceTier[] {
  const custom = tiersFromDatabase(item.price_tiers);
  if (custom) return custom;

  const { section, price_display } = item;
  const base = price_display?.trim() || null;

  if (section === "yogurt") return YOGURT_TIERS;
  if (section === "coffee") {
    const rows: PriceTier[] = [];
    if (base) rows.push({ label: "Menu · classic prep", price: base, hint: "Bar can customize size" });
    rows.push(...COFFEE_TIERS);
    return rows;
  }
  if (section === "pastries") {
    return base ? [{ label: "Each", price: base, hint: PASTRY_NOTE }] : [{ label: "Each", price: "—", hint: PASTRY_NOTE }];
  }
  if (section === "drinks") {
    return base
      ? [{ label: "Regular", price: base, hint: DRINK_NOTE }]
      : [{ label: "Regular", price: "—", hint: DRINK_NOTE }];
  }
  if (isFrozenStyleSection(section)) {
    if (base && base.toLowerCase().includes("from")) {
      return GELATO_STYLE_TIERS.map((t, i) =>
        i === 1 ? { ...t, price: base } : t
      );
    }
    return GELATO_STYLE_TIERS;
  }
  return base ? [{ label: "Menu price", price: base }] : [];
}

export function detailSectionLabel(section: MenuSection): string {
  switch (section) {
    case "gelato":
      return "Cream gelato";
    case "sorbet":
      return "Sorbet · vegan";
    case "yogurt":
      return "Frozen yogurt";
    case "coffee":
      return "Italian coffee";
    case "pastries":
      return "New products";
    case "drinks":
      return "Drinks";
    case "bestsellers":
      return "Best seller";
    case "seasonal":
      return "Seasonal";
    default:
      return "Menu";
  }
}

export function detailPricingTitle(section: MenuSection): string {
  if (FROZEN_SECTIONS.includes(section) || section === "bestsellers" || section === "seasonal") {
    return "Scoops & sizes";
  }
  if (section === "yogurt") return "Cups & sizes";
  if (section === "coffee") return "Sizes & bar pricing";
  if (section === "pastries") return "Pricing";
  if (section === "drinks") return "Pricing";
  return "Pricing";
}
