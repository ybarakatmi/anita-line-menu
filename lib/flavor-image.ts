/** Sections whose items use `/public/images/flavors/<slug>.png` when `image_url` is unset. */
export const FLAVOR_IMAGE_SECTIONS = ["gelato", "sorbet", "bestsellers", "seasonal"] as const;

export type FlavorImageSection = (typeof FLAVOR_IMAGE_SECTIONS)[number];

/** Kebab slug from display name — must match files in `public/images/flavors/`. */
export function flavorImageSlug(displayName: string): string {
  return displayName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function flavorImagePublicPath(displayName: string): string {
  return `/images/flavors/${flavorImageSlug(displayName)}.png`;
}

/** Canonical catalog (28 gelato + 4 sorbet) — used to prefer local files over remote fallbacks. */
export const CANONICAL_FLAVOR_SLUGS: ReadonlySet<string> = new Set([
  "pistachio",
  "chocolate",
  "black-forest",
  "strawberry",
  "cookieman",
  "mango",
  "pavlova-and-mixed-berries",
  "macadamia-cream",
  "chocolate-and-hazelnut",
  "chocolate-caramel-and-almonds",
  "milk-chocolate-pretzel",
  "white-chocolate-and-cookies",
  "nougat-wafer",
  "white-chocolate-and-nougat-wafers",
  "vanilla",
  "white-chocolate-and-pistachio-cream",
  "salted-cashew",
  "mint-chocolate",
  "strawberry-mascarpone-and-ricotta",
  "cheesecake-caramel-cookies",
  "chocolate-nut-cream",
  "creme-brulee-pistachio-crumble",
  "hazelnut-mousse-and-chocolate-crunch",
  "white-chocolate-espresso",
  "salted-caramel",
  "biscuit-cake",
  "vegan-cookie-and-cream",
  "no-sugar-added-coffee",
  "coconut-sorbet",
  "limoncello",
  "watermelon-and-fresh-mint",
  "dark-chocolate",
]);
