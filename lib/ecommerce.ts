/**
 * GA4 item-scoped ecommerce for the menu.
 *
 * The custom events (menu_item_open, section_view) stay as they are — they answer
 * "what did this QR placement do". These ecommerce events feed GA4's *built-in*
 * item reports, which is the only way to rank 32 flavors against each other
 * without hand-building a report per flavor.
 */
import { getAttribution, normalizeItemName, pushDataLayer } from "@/lib/gtm";
import type { MenuItemRow } from "@/types/menu";

export type Ga4Item = {
  item_id: string;
  item_name: string;
  item_category: string;
  item_list_id: string;
  item_list_name: string;
  index: number;
  price?: number;
};

/**
 * Prices are admin free-text ("$4.50", "from $6", "5.00 / 7.50"), and GA4 rejects
 * a non-numeric price outright. Take the first number we can find, falling back to
 * the cheapest tier so a tap-to-expand item still reports something.
 */
export function parsePrice(item: MenuItemRow): number | undefined {
  const fromDisplay = firstNumber(item.price_display);
  if (fromDisplay !== undefined) return fromDisplay;

  const tierPrices = (item.price_tiers ?? [])
    .map((t) => firstNumber(t?.price))
    .filter((n): n is number => n !== undefined);

  return tierPrices.length ? Math.min(...tierPrices) : undefined;
}

function firstNumber(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const n = Number.parseFloat(match[0]);
  return Number.isFinite(n) ? n : undefined;
}

export function toGa4Item(
  item: MenuItemRow,
  listId: string,
  listName: string,
  index: number
): Ga4Item {
  const price = parsePrice(item);
  return {
    item_id: item.id,
    item_name: normalizeItemName(item.name),
    item_category: item.section,
    item_list_id: listId,
    item_list_name: listName,
    index,
    ...(price !== undefined ? { price } : {}),
  };
}

/**
 * GA4 merges successive ecommerce objects unless you null it out first, which
 * leaks the previous list's items into the next event.
 */
function pushEcommerce(event: string, ecommerce: Record<string, unknown>) {
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event, ...getAttribution(), ecommerce });
}

/** GA4 caps items per event; a long carousel would otherwise be silently truncated. */
const MAX_ITEMS_PER_EVENT = 50;

export function pushViewItemList(
  listId: string,
  listName: string,
  items: MenuItemRow[]
) {
  if (!items.length) return;
  pushEcommerce("view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items: items
      .slice(0, MAX_ITEMS_PER_EVENT)
      .map((item, i) => toGa4Item(item, listId, listName, i)),
  });
}

export function pushSelectItem(
  item: MenuItemRow,
  listId: string,
  listName: string,
  index: number
) {
  pushEcommerce("select_item", {
    item_list_id: listId,
    item_list_name: listName,
    items: [toGa4Item(item, listId, listName, index)],
  });
}

export function pushViewItem(
  item: MenuItemRow,
  listId: string,
  listName: string,
  index: number
) {
  const ga4Item = toGa4Item(item, listId, listName, index);
  pushEcommerce("view_item", {
    ...(ga4Item.price !== undefined
      ? { currency: "USD", value: ga4Item.price }
      : {}),
    items: [ga4Item],
  });
}
