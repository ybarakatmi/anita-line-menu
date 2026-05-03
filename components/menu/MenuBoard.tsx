"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { withDefaultNewProductsIfEmpty } from "@/lib/menu-fallback";
import type { MenuDataMode, MenuItemRow, MenuSection, SiteSettingsRow } from "@/types/menu";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper/types";

const DEFAULT_HERO_SECONDARY_LABEL = "Visit Tarzana";
const DEFAULT_HERO_SECONDARY_HREF =
  "https://www.google.com/maps/search/?api=1&query=Anita+Gelato+Tarzana+CA";

/**
 * Muted inline MP4 for iOS Safari + Chrome autoplay policy (playsinline + muted required).
 */
function InlineBackgroundVideo({
  videoRef,
  src,
  poster,
  className,
  preload,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  src: string;
  poster: string;
  className: string;
  preload?: "none" | "metadata" | "auto";
}) {
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "true");
    el.muted = true;
    el.defaultMuted = true;
    const play = () => void el.play().catch(() => {});
    play();
    el.addEventListener("loadeddata", play, { once: true });
    const onVis = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("loadeddata", play);
    };
  }, [src, videoRef]);

  return (
    <video
      ref={videoRef}
      key={src}
      className={className}
      autoPlay
      muted
      playsInline
      loop
      preload={preload ?? "metadata"}
      {...(poster ? { poster } : {})}
      disablePictureInPicture
      controls={false}
      aria-hidden
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

const SECTION_ORDER: MenuSection[] = [
  "seasonal",
  "bestsellers",
  "coffee",
  "pastries",
  "drinks",
  "yogurt",
  "gelato",
  "sorbet",
];

const NAV: { id: string; label: string }[] = [
  { id: "seasonal", label: "New & Seasonal" },
  { id: "bestsellers", label: "Best Sellers" },
  { id: "coffee", label: "Coffee" },
  { id: "pastries", label: "New products" },
  { id: "drinks", label: "Drinks" },
  { id: "yogurt", label: "Yogurt" },
  { id: "gelato", label: "Cream Gelato" },
  { id: "sorbet", label: "Sorbets" },
];

const INSTA_LINKS = [
  "https://www.instagram.com/anitagelatousa/",
  "https://www.instagram.com/anitagelatousa/p/CodDNEOvV6v/",
  "https://www.instagram.com/anitagelatousa/p/C82RJ_co9yU/",
  "https://www.instagram.com/anitagelatousa/",
  "https://www.instagram.com/anitagelatousa/reel/Ctx7f5xrVOO/",
];

const INSTA_PHOTOS = [
  "https://www.anita-gelato.com/wp-content/uploads/2024/06/3-1-768x959.jpg",
  "https://www.anita-gelato.com/wp-content/uploads/2024/06/Ice-Cream-Table-768x960.jpg",
  "https://www.anita-gelato.com/wp-content/uploads/2024/06/Ice-Cream-Flower-768x960.jpg",
  "https://www.anita-gelato.com/wp-content/uploads/2024/06/Cones-and-Flowers-768x768.jpg",
  "https://www.anita-gelato.com/wp-content/uploads/2024/06/Ice-Cream-Macaroon--768x1152.jpg",
];

const BEST_SELLER_SHOWCASE = [
  {
    name: "CHOCOLATE",
    description: "Luxurious milk chocolate",
    image: "https://www.anita-gelato.com/wp-content/uploads/2024/06/1-1.png",
  },
  {
    name: "NOUGAT WAFER",
    description: "Hazelnut-flavored gelato with wafers",
    image: "https://www.anita-gelato.com/wp-content/uploads/2024/06/2-1.png",
  },
  {
    name: "VEGAN COOKIE & CREAM",
    description: "Chocolate cookie-flavored vegan cream",
    image: "https://www.anita-gelato.com/wp-content/uploads/2024/06/3-1.png",
  },
  {
    name: "MALABI",
    description: "Pistachio cream with milk jam and pistachios",
    image: "https://www.anita-gelato.com/wp-content/uploads/2024/06/4-1.png",
  },
  {
    name: "COOKIEMAN",
    description: "Biscuit base with hazelnut chocolate and meringues",
    image: "https://www.anita-gelato.com/wp-content/uploads/2024/06/5-1.png",
  },
  {
    name: "BANOFFEE PIE",
    description: "Banana caramel gelato with cookie crumble",
    image: "https://www.anita-gelato.com/wp-content/uploads/2024/06/6-1.png",
  },
  {
    name: "WHITE CHOCOLATE PRETZEL",
    description: "Sweet and salty white chocolate pretzel cream",
    image: "https://www.anita-gelato.com/wp-content/uploads/2024/06/7-1.png",
  },
];

const FLAVOR_IMAGE_BY_NAME: Record<string, string> = {
  pistachio: "https://www.anita-gelato.com/wp-content/uploads/2024/09/Pistachio-Cream-1-683x1024.jpg",
  chocolate: "https://www.anita-gelato.com/wp-content/uploads/2024/08/Chocolate--683x1024.jpg",
  "black forest": "https://www.anita-gelato.com/wp-content/uploads/2024/08/Black-Forest-683x1024.jpg",
  strawberry: "https://www.anita-gelato.com/wp-content/uploads/2024/08/Strawberry-683x1024.jpg",
  cookieman: "https://www.anita-gelato.com/wp-content/uploads/2024/08/cookiman-683x1024.jpg",
  mango: "https://www.anita-gelato.com/wp-content/uploads/2024/09/Mango--683x1024.jpg",
  "pavlova mixed berries":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Pavlova-and-Berries-683x1024.jpg",
  "pavlova and mixed berries":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Pavlova-and-Berries-683x1024.jpg",
  "hazelnut mousse crunch choc":
    "https://www.anita-gelato.com/wp-content/uploads/2024/09/Chocolate-and-Hazelnut-683x1024.jpg",
  "chocolate hazelnut":
    "https://www.anita-gelato.com/wp-content/uploads/2024/09/Chocolate-and-Hazelnut-683x1024.jpg",
  "macadamia cream":
    "https://www.anita-gelato.com/wp-content/uploads/2024/09/Macadamia-and-Cream-683x1024.jpg",
  "chocolate caramel and almonds":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Chocolate-with-Almonds-and-Caramel_-683x1024.jpg",
  "milk chocolate pretzel":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Milk-Chocolate-Pretzels_-683x1024.jpg",
  "white chocolate and cookies":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/White-Chocolate-Cookies-683x1024.jpg",
  "nougat wafer": "https://www.anita-gelato.com/wp-content/uploads/2024/08/Nougat-Wafers-683x1024.jpg",
  "white chocolate and nougat wafers":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/White-Chocolate-Nougat-Wafers-683x1024.jpg",
  vanilla: "https://www.anita-gelato.com/wp-content/uploads/2024/08/Vanilla-683x1024.jpg",
  "white chocolate and pistachio cream":
    "https://www.anita-gelato.com/wp-content/uploads/2024/09/White-chocolate-pistachio-cream-683x1024.jpg",
  "salted cashew": "https://www.anita-gelato.com/wp-content/uploads/2024/08/Salted-Cashews-683x1024.jpg",
  "mint chocolate": "https://www.anita-gelato.com/wp-content/uploads/2024/08/Chocolate-Mint-683x1024.jpg",
  "strawberry mascarpone and ricotta":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Mascarpone-Ricotta-Strawberry_-683x1024.jpg",
  "cheesecake caramel cookies":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Caramel-Cookies-Cheesecake_-683x1024.jpg",
  "chocolate nut cream":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Hazelnut-Milk-Chocolate-Cream-683x1024.jpg",
  "creme brulee pistachio crumble":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Creme-brulee-crumble-pistachio-683x1024.jpg",
  "hazelnut mousse and chocolate crunch":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Hazelnut-Mousse-Crunch_-683x1024.jpg",
  "hazelnut mousse chocolate crunch":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Hazelnut-Mousse-Crunch_-683x1024.jpg",
  "white chocolate espresso":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/White-Chocolate-Espresso--683x1024.jpg",
  "salted caramel":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Salted-Caramel_-683x1024.jpg",
  "biscuit cake":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Biscuit-Cake-683x1024.jpg",
  "vegan cookie and cream":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Vegan-Cookie-Cream-683x1024.jpg",
  "no sugar added coffee":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/No-Sugar-Added-Coffee-683x1024.jpg",
  "suger free coffee":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/No-Sugar-Added-Coffee-683x1024.jpg",
  "vegan strawberry": "https://www.anita-gelato.com/wp-content/uploads/2024/08/Strawberry-683x1024.jpg",
  "vegan coconut": "https://www.anita-gelato.com/wp-content/uploads/2024/08/Coconut--683x1024.jpg",
  "vegan mango": "https://www.anita-gelato.com/wp-content/uploads/2024/09/Mango--683x1024.jpg",
  "vegan dark chocolate":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Dark-Chocolate_-683x1024.jpg",
  "vegan limoncello":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Limoncello-Fresh-Mint-683x1024.jpg",
  "vegan watermelon mint":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Watermelon-Fresh-Mint-683x1024.jpg",
  "vegan cookie": "https://www.anita-gelato.com/wp-content/uploads/2024/08/Vegan-Cookie-Cream-683x1024.jpg",
  "coconut sorbet": "https://www.anita-gelato.com/wp-content/uploads/2024/08/Coconut--683x1024.jpg",
  limoncello: "https://www.anita-gelato.com/wp-content/uploads/2024/08/Limoncello-Fresh-Mint-683x1024.jpg",
  "watermelon fresh mint":
    "https://www.anita-gelato.com/wp-content/uploads/2024/08/Watermelon-Fresh-Mint-683x1024.jpg",
  "dark chocolate": "https://www.anita-gelato.com/wp-content/uploads/2024/08/Dark-Chocolate_-683x1024.jpg",
};

/** Local product shots for New products (pastries) when `image_url` is unset — same-origin, on-brand framing. */
const PASTRY_IMAGE_BY_NAME: Record<string, string> = {
  "butter croissant": "/images/pastries/butter-croissant.png",
  "pain au chocolat": "/images/pastries/pain-au-chocolat.png",
};

function normalizeFlavorName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function flavorTokens(value: string) {
  return normalizeFlavorName(value)
    .split(" ")
    .filter((t) => t.length > 2 && !["and", "with", "cream", "flavored"].includes(t));
}

function getFlavorImageUrl(item: MenuItemRow) {
  const explicit = item.image_url?.trim();
  if (explicit) return explicit;

  if (item.section === "pastries") {
    const pastryKey = normalizeFlavorName(item.name);
    const pastryImg = PASTRY_IMAGE_BY_NAME[pastryKey];
    if (pastryImg) return pastryImg;
  }

  const normalized = normalizeFlavorName(item.name);
  const direct = FLAVOR_IMAGE_BY_NAME[normalized];
  if (direct) return direct;

  const aliases: Array<{ match: RegExp; image: string }> = [
    {
      match: /\bwhite choc(olate)?\b.*\bpistachio\b/,
      image:
        "https://www.anita-gelato.com/wp-content/uploads/2024/09/White-chocolate-pistachio-cream-683x1024.jpg",
    },
    {
      match: /\bchoc(olate)?\b.*\balmond(s)?\b.*\bcaramel\b/,
      image:
        "https://www.anita-gelato.com/wp-content/uploads/2024/08/Chocolate-with-Almonds-and-Caramel_-683x1024.jpg",
    },
    {
      match: /\bhazelnut\b.*\bchoc(olate)?\b.*\bcream\b/,
      image:
        "https://www.anita-gelato.com/wp-content/uploads/2024/08/Hazelnut-Milk-Chocolate-Cream-683x1024.jpg",
    },
    {
      match: /\bcoffee\b.*\bstracciatella\b|\bwhite chocolate espresso\b/,
      image:
        "https://www.anita-gelato.com/wp-content/uploads/2024/08/White-Chocolate-Espresso--683x1024.jpg",
    },
    {
      match: /\bmascarpone\b.*\bstrawberry\b/,
      image:
        "https://www.anita-gelato.com/wp-content/uploads/2024/08/Mascarpone-Ricotta-Strawberry_-683x1024.jpg",
    },
    {
      match: /\bbiscuit\b.*\bcake\b|\bbiscuit cheesecake\b/,
      image: "https://www.anita-gelato.com/wp-content/uploads/2024/08/Biscuit-Cake-683x1024.jpg",
    },
    {
      match: /\bvegan\b.*\bcookie\b.*\bcream\b/,
      image:
        "https://www.anita-gelato.com/wp-content/uploads/2024/08/Vegan-Cookie-Cream-683x1024.jpg",
    },
    {
      match: /\bno sugar added coffee\b|\bsuger free coffee\b/,
      image:
        "https://www.anita-gelato.com/wp-content/uploads/2024/08/No-Sugar-Added-Coffee-683x1024.jpg",
    },
  ];

  const aliasHit = aliases.find((rule) => rule.match.test(normalized))?.image;
  if (aliasHit) return aliasHit;

  // Fuzzy fallback: choose the mapped key with highest token overlap.
  const itemTokens = new Set(flavorTokens(item.name));
  let bestScore = 0;
  let bestImage: string | undefined;

  for (const [key, image] of Object.entries(FLAVOR_IMAGE_BY_NAME)) {
    const keyTokens = flavorTokens(key);
    if (!keyTokens.length) continue;
    let matches = 0;
    for (const token of keyTokens) {
      if (itemTokens.has(token)) matches += 1;
    }
    const score = matches / keyTokens.length;
    if (score > bestScore) {
      bestScore = score;
      bestImage = image;
    }
  }

  // Require meaningful similarity to avoid wrong photos.
  if (bestScore >= 0.5 && bestImage) return bestImage;

  return item.image_url || undefined;
}

function sortItems(items: MenuItemRow[]) {
  return [...items].sort(
    (a, b) =>
      SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section) ||
      a.sort_order - b.sort_order
  );
}

function sortItemsWithNewProductsDefaults(items: MenuItemRow[]) {
  return sortItems(withDefaultNewProductsIfEmpty(items));
}

function useFadeSections(deps: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [deps]);
}

/** Keeps --sticky-offset CSS variable in sync with the combined height of
 *  .topbar + .nav so scroll-margin-top on sections always matches exactly. */
function useStickyOffset() {
  useEffect(() => {
    function update() {
      const topbar = document.querySelector<HTMLElement>(".topbar");
      const nav = document.querySelector<HTMLElement>(".nav");
      const h = (topbar?.offsetHeight ?? 0) + (nav?.offsetHeight ?? 0) + 8;
      document.documentElement.style.setProperty("--sticky-offset", `${h}px`);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
}

type GelatoFilter = "all" | "new" | "choc" | "nut" | "fruit";

function useCarouselTrack() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".flav-card") as HTMLElement | null;
    if (!card) return;
    const w = card.offsetWidth + 12;
    const p = Math.round(track.scrollLeft / (w * 2));
    setPage(Math.max(0, p));
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", sync, { passive: true });
    return () => track.removeEventListener("scroll", sync);
  }, [sync]);

  const jump = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const card = track.querySelector(".flav-card") as HTMLElement | null;
      const w = (card?.offsetWidth ?? 150) + 12;
      track.scrollTo({ left: i * w * 2, behavior: "smooth" });
    },
    []
  );

  return { trackRef, page, jump };
}

export function MenuBoard({
  initialItems,
  initialSettings,
  mode,
}: {
  initialItems: MenuItemRow[];
  initialSettings: SiteSettingsRow;
  mode: MenuDataMode;
}) {
  const [items, setItems] = useState(() => sortItemsWithNewProductsDefaults(initialItems));
  const [settings, setSettings] = useState(initialSettings);
  const [navActive, setNavActive] = useState("seasonal");
  const [gelatoFilter, setGelatoFilter] = useState<GelatoFilter>("all");
  const [activeBestSeller, setActiveBestSeller] = useState(0);
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const bestSellerSwiperRef = useRef<SwiperType | null>(null);
  const gelatoCarousel = useCarouselTrack();
  const newProductsCarousel = useCarouselTrack();
  const sorbetCarousel = useCarouselTrack();
  const yogurtCarousel = useCarouselTrack();

  // After admin saves, Next.js refreshes RSC props but useState keeps the first snapshot.
  // Re-sync so new images (e.g. coffee uploads) show without a hard reload.
  useEffect(() => {
    setItems(sortItemsWithNewProductsDefaults(initialItems));
  }, [initialItems]);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const customHeroVideo = Boolean(settings.hero_video_url?.trim());
  const customSeparatorVideo = Boolean(settings.separator_video_url?.trim());
  const heroVideoSrc = settings.hero_video_url?.trim() ?? "";
  const heroPosterSrc = settings.hero_video_poster_url?.trim() ?? "";
  const separatorVideoSrc = settings.separator_video_url?.trim() ?? "";
  const separatorPosterSrc = heroPosterSrc;

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const separatorVideoRef = useRef<HTMLVideoElement>(null);
  const heroSecondaryLabel = settings.hero_secondary_label?.trim() || DEFAULT_HERO_SECONDARY_LABEL;
  const heroSecondaryHref = settings.hero_secondary_href?.trim() || DEFAULT_HERO_SECONDARY_HREF;

  useFadeSections(items.length);
  useStickyOffset();

  const reload = useCallback(async () => {
    if (mode !== "live") return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      if (data?.length) setItems(sortItemsWithNewProductsDefaults(data as MenuItemRow[]));
    } catch {
      /* keep current */
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "live") return;
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }
    const channel = supabase
      .channel("menu_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => {
          void reload();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [mode, reload]);

  const bySection = useMemo(() => {
    const m = new Map<MenuSection, MenuItemRow[]>();
    for (const s of SECTION_ORDER) m.set(s, []);
    for (const it of items) {
      const list = m.get(it.section);
      if (list) list.push(it);
    }
    return m;
  }, [items]);

  const gelatoItems = useMemo(
    () => (bySection.get("gelato") ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
    [bySection]
  );
  const gelatoFiltered = useMemo(() => {
    if (gelatoFilter === "all") return gelatoItems;
    if (gelatoFilter === "new") return gelatoItems.filter((i) => i.is_new);
    return gelatoItems.filter((i) => i.tags?.includes(gelatoFilter));
  }, [gelatoItems, gelatoFilter]);

  const displayGelatos = gelatoFiltered.length ? gelatoFiltered : gelatoItems;
  const newProductsItems = bySection.get("pastries") ?? [];
  useEffect(() => {
    gelatoCarousel.trackRef.current?.scrollTo({ left: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset carousel on filter / data change
  }, [gelatoFilter, displayGelatos.map((g) => g.id).join("|")]);

  useEffect(() => {
    newProductsCarousel.trackRef.current?.scrollTo({ left: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newProductsItems.map((g) => g.id).join("|")]);

  const navTo = (id: string, btn?: HTMLElement | null) => {
    setNavActive(id);
    const target = document.getElementById(id);
    if (!target) return;

    // Re-measure sticky stack right now — handles iOS URL bar shrink/expand
    const topbar = document.querySelector<HTMLElement>(".topbar");
    const nav = document.querySelector<HTMLElement>(".nav");
    const stickyOffset = (topbar?.offsetHeight ?? 0) + (nav?.offsetHeight ?? 0) + 8;
    document.documentElement.style.setProperty("--sticky-offset", `${stickyOffset}px`);

    // Instantly center the nav button horizontally on the .nav container only —
    // this avoids the smooth-scroll-cancellation race with the page scroll below.
    if (btn && nav) {
      const navEl = nav as HTMLElement;
      const left =
        btn.offsetLeft - navEl.clientWidth / 2 + btn.offsetWidth / 2;
      navEl.scrollTo({ left, behavior: "auto" });
    }

    // Compute absolute target and scroll smoothly. Using window.scrollTo with
    // an absolute Y is more deterministic than scrollIntoView when the page
    // contains lazy-loaded images that may shift layout during scroll.
    const initialTargetY =
      target.getBoundingClientRect().top + window.scrollY - stickyOffset;
    window.scrollTo({ top: Math.max(0, initialTargetY), behavior: "smooth" });

    // After the scroll has settled, run a corrective adjustment — handles
    // images that lazy-loaded mid-flight and shifted the section position.
    let attempts = 0;
    const correct = () => {
      attempts++;
      const rect = target.getBoundingClientRect();
      const desiredTop = stickyOffset; // section's top should be just below sticky stack
      const drift = rect.top - desiredTop;
      if (Math.abs(drift) > 4) {
        window.scrollTo({ top: window.scrollY + drift, behavior: "smooth" });
      }
      if (attempts < 3) setTimeout(correct, 350);
    };
    setTimeout(correct, 600);
  };

  const ticker = settings.ticker_segments ?? [];

  return (
    <div className="app-shell">
      {mode === "fallback" && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[400] px-4 py-2 text-center text-[10px] font-medium tracking-wide text-[var(--olive)]"
          style={{ background: "rgba(250,247,242,0.92)", borderTop: "1px solid var(--cream-dk)" }}
        >
          Demo menu — connect Supabase in .env.local for live data & realtime.
        </div>
      )}

      <section className="hero" id="top">
        <div className="hero-sky">
          {customHeroVideo ? (
            <InlineBackgroundVideo
              videoRef={heroVideoRef}
              src={heroVideoSrc}
              poster={heroPosterSrc}
              className="hero-video"
              preload="auto"
            />
          ) : (
            <div className="hero-video hero-bg-fallback" aria-hidden />
          )}
          <div className="hero-overlay" />
        </div>
        <a
          className="hero-gift"
          href="https://app.gift-it.com.au/buy/anita"
          target="_blank"
          rel="nofollow noreferrer"
          aria-label="Get gift card"
        >
          GIFT CARD
        </a>
        <a className="hero-scroll" href="#best-sellers">
          SCROLL &amp; DISCOVER
        </a>
        <div className="hero-content">
          <div className="h-eyebrow">{settings.hero_eyebrow ?? "Tarzana · Los Angeles"}</div>
          <div className="h-brand">
            LA MAMMA
            <br />
            DEL GELATO
          </div>
          <div className="h-it">Anita Gelato</div>
          <div className="h-tags">
            <span className="h-tag">Gelato</span>
            <span className="h-tag">Yogurt</span>
            <span className="h-tag">Coffee</span>
          </div>
          <div className="hero-actions">
            <a className="hero-btn hero-btn-primary" href="#bestsellers">
              VIEW FLAVORS
            </a>
            <a
              className="hero-btn hero-btn-secondary"
              href={heroSecondaryHref}
              target="_blank"
              rel="nofollow noreferrer"
            >
              {heroSecondaryLabel}
            </a>
          </div>
        </div>
      </section>

      <header className="topbar">
        <a
          className="topbar-logo"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            navTo("top");
          }}
        >
          <Image
            src="https://www.anita-gelato.com/wp-content/uploads/2023/05/logo.svg"
            alt="Anita Gelato"
            width={208}
            height={35}
            priority
          />
        </a>
      </header>

      <nav className="nav" aria-label="Section navigation">
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`nb${navActive === n.id ? " active" : ""}`}
            onClick={(e) => navTo(n.id, e.currentTarget)}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <div className="ticker">
        <div className="t-inner">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={`${t}-${i}`}>
              <span className="t-item">{t}</span>
              <span className="t-item t-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="menu-section seasonal-feature fade-in" id="seasonal">
        <div className="sec-head">
          <span className="sec-the">Right Now</span>
          <div className="sec-big">
            New &amp;
            <br />
            Seasonal
          </div>
          <div className="sec-tag">✦ &nbsp; {settings.seasonal_tagline ?? "Spring 2026 Arrivals"}</div>
          <p className="seasonal-eyebrow-sub">
            Limited batches · Rotating often · Ask what&apos;s scooping today
          </p>
        </div>
        <div className="spec-grid">
          {(bySection.get("seasonal") ?? []).map((item, index) => {
            // Prefer admin-uploaded image; otherwise fall back to the catalog photo
            // matched by flavor name (same logic powering the gelato carousel).
            const seasonalImage = item.image_url ?? getFlavorImageUrl(item);
            const badgeLower = (item.badge ?? "").toLowerCase();
            const autoRibbon = badgeLower.includes("limited") ? "Limited" : "Seasonal";
            const ribbonOverride = item.seasonal_ribbon_label?.trim();
            const seasonalRibbonLabel = ribbonOverride
              ? ribbonOverride.slice(0, 28)
              : autoRibbon;
            const ribbonSpanLong = seasonalRibbonLabel.length > 12;

            return (
              <div
                key={item.id}
                className="spec-card"
                style={{ "--seasonal-stagger": String(index) } as CSSProperties}
              >
                <div className="spec-ribbon spec-ribbon--seasonal" aria-hidden="true">
                  <span className={ribbonSpanLong ? "spec-ribbon-text--long" : undefined}>{seasonalRibbonLabel}</span>
                </div>
                <div className="spec-img">
                  {seasonalImage ? (
                    <Image
                      src={seasonalImage}
                      alt={item.name}
                      width={380}
                      height={256}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 768px) 52vw, 190px"
                    />
                  ) : (
                    <div className="spec-img-emoji">🍦</div>
                  )}
                </div>
                <div className="spec-body">
                  <div className="spec-name">{item.name}</div>
                  <div className="spec-desc">{item.description}</div>
                  {item.promo_label?.trim() ? (
                    <p className="spec-promo">{item.promo_label.trim()}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <span id="best-sellers" />
      <section className="menu-section fade-in" id="bestsellers">
        <div className="sec-head">
          <span className="sec-the">Customer Favorites</span>
          <div className="sec-big">
            Best
            <br />
            Sellers
          </div>
          <div className="sec-tag">✦ &nbsp; Most loved scoops</div>
        </div>
        <Swiper
          id="bestsellerTrack"
          className="bestsellers-swiper"
          modules={[Navigation, Pagination]}
          speed={500}
          spaceBetween={10}
          centeredSlides
          watchSlidesProgress
          navigation
          pagination={{ clickable: true }}
          onSwiper={(swiper) => {
            bestSellerSwiperRef.current = swiper;
            setActiveBestSeller(swiper.activeIndex);
          }}
          onSlideChange={(swiper) => setActiveBestSeller(swiper.realIndex)}
          breakpoints={{
            0: { slidesPerView: 1.45, centeredSlides: true },
            640: { slidesPerView: 2.4, centeredSlides: true },
            1024: { slidesPerView: 4.8, centeredSlides: false },
          }}
        >
          {BEST_SELLER_SHOWCASE.map((item, idx) => (
            <SwiperSlide
              key={item.name}
              className="bestseller-slide"
              onClick={() => bestSellerSwiperRef.current?.slideTo(idx)}
            >
              <div className="bestseller-scoop-wrap">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={530}
                  height={640}
                  className="bestseller-scoop"
                  sizes="(max-width: 768px) 40vw, 160px"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="bestseller-focus">
          <h3 className="bestseller-focus-name">{BEST_SELLER_SHOWCASE[activeBestSeller]?.name}</h3>
          <p className="bestseller-focus-desc">{BEST_SELLER_SHOWCASE[activeBestSeller]?.description}</p>
          <a
            className="bestseller-focus-btn"
            href="https://www.anita-gelato.com/flavors/"
            target="_blank"
            rel="nofollow noreferrer"
          >
            ALL FLAVORS
          </a>
        </div>
      </section>

      <section className="coffee-section fade-in" id="coffee">
        <div className="sec-head">
          <span className="sec-the">Imported from Italy</span>
          <div className="sec-big">
            Italian
            <br />
            Coffee
          </div>
          <div className="sec-tag">
            ✦ &nbsp; Beans Flown in from Italy
          </div>
        </div>
        <div className="origin-badge">
          <span className="text-lg" aria-hidden>
            🇮🇹
          </span>
          <span className="origin-text">
            Direct import · <b>Italy</b>
          </span>
        </div>
        <div className="coffee-list">
          {(bySection.get("coffee") ?? []).map((item) => (
            <div key={item.id} className="coffee-card">
              {item.image_url ? (
                <div className="coffee-card-photo">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={336}
                    height={280}
                    className="h-full w-full object-cover object-center"
                    sizes="(max-width: 768px) 46vw, 168px"
                  />
                </div>
              ) : (
                <div className="coffee-card-ico">{item.emoji ?? "☕"}</div>
              )}
              <div className="coffee-card-name">{item.name}</div>
              <div className="coffee-card-desc">{item.description}</div>
              <div className="coffee-card-price">{item.price_display}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="menu-section sage-bg fade-in new-products-section" id="pastries">
        <div className="sec-head">
          <span className="sec-the">{settings.pastry_sec_the ?? "Just in"}</span>
          <div className="sec-big">
            {(settings.pastry_sec_big_line1 ?? "New").trim()}
            <br />
            {(settings.pastry_sec_big_line2 ?? "Products").trim()}
          </div>
          <div className="sec-tag">✦ &nbsp; {settings.pastry_sec_tag ?? "Pastries · Baked goods · Rotating picks"}</div>
        </div>
        <div className="car-track" id="newProductsTrack" ref={newProductsCarousel.trackRef}>
          {newProductsItems.map((item) => (
            <FlavorCard key={item.id} item={item} />
          ))}
        </div>
        <div className="car-dots">
          {Array.from({ length: Math.max(1, Math.ceil(newProductsItems.length / 2)) }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`car-dot${newProductsCarousel.page === i ? " active" : ""}`}
              aria-label={`New products page ${i + 1}`}
              onClick={() => newProductsCarousel.jump(i)}
            />
          ))}
        </div>
      </section>

      <section className="menu-section blush-bg fade-in" id="drinks">
        <div className="sec-head">
          <span className="sec-the">Also Available</span>
          <div className="sec-big">
            Drinks
            <br />
            &amp; More
          </div>
          <div className="sec-tag">✦ &nbsp; Sparkling · Sodas · Water</div>
        </div>
        <div className="drinks-grid">
          {(bySection.get("drinks") ?? []).map((item) => (
            <div key={item.id} className="drink-card">
              {item.image_url ? (
                <div className="drink-card-photo">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={320}
                    height={240}
                    className="h-full w-full object-cover object-center"
                    sizes="(max-width: 768px) 44vw, 160px"
                  />
                </div>
              ) : (
                <div className="drink-ico">{item.emoji ?? "🥤"}</div>
              )}
              <div className="drink-name">{item.name}</div>
              <div className="drink-desc">{item.description}</div>
              <div className="drink-price">{item.price_display}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="menu-section yogurt-section fade-in" id="yogurt">
        <div className="sec-head">
          <span className="sec-the">Swirled Fresh</span>
          <div className="sec-big">
            Frozen
            <br />
            Yogurt
          </div>
          <div className="sec-tag">✦ &nbsp; Tart &amp; soft serve</div>
        </div>
        <div className="car-track" id="yogurtTrack" ref={yogurtCarousel.trackRef}>
          {(bySection.get("yogurt") ?? []).map((item) => (
            <FlavorCard key={item.id} item={item} />
          ))}
        </div>
        <div className="car-dots">
          {Array.from({
            length: Math.max(1, Math.ceil((bySection.get("yogurt") ?? []).length / 2)),
          }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`car-dot${yogurtCarousel.page === i ? " active" : ""}`}
              aria-label={`Yogurt page ${i + 1}`}
              onClick={() => yogurtCarousel.jump(i)}
            />
          ))}
        </div>
      </section>

      <section className="menu-section sage-bg fade-in" id="gelato">
        <div className="sec-head">
          <span className="sec-the">Handcrafted Daily</span>
          <div className="sec-big">
            Cream
            <br />
            Gelato
          </div>
          <div className="sec-tag">✦ &nbsp; 32 Flavors · No Artificial Colors</div>
        </div>
        <div className="car-filters">
          {(
            [
              ["all", "All"],
              ["new", "New"],
              ["choc", "Chocolate"],
              ["nut", "Nuts"],
              ["fruit", "Fruit"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`car-filter${gelatoFilter === key ? " active" : ""}`}
              onClick={() => setGelatoFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="car-track" id="gelatoTrack" ref={gelatoCarousel.trackRef}>
          {displayGelatos.map((item) => (
            <FlavorCard key={item.id} item={item} />
          ))}
        </div>
        <div className="car-dots">
          {Array.from({ length: Math.max(1, Math.ceil(displayGelatos.length / 2)) }).map(
            (_, i) => (
              <button
                key={i}
                type="button"
                className={`car-dot${gelatoCarousel.page === i ? " active" : ""}`}
                aria-label={`Page ${i + 1}`}
                onClick={() => gelatoCarousel.jump(i)}
              />
            )
          )}
        </div>
      </section>

      <section className="menu-section blush-bg fade-in" id="sorbet">
        <div className="sec-head">
          <span className="sec-the">Dairy-Free</span>
          <div className="sec-big">
            Sorbets
            <br />
            &amp; Vegan
          </div>
          <div className="sec-tag">✦ &nbsp; 100% Plant-Based</div>
        </div>
        <div className="car-track" id="sorbetTrack" ref={sorbetCarousel.trackRef}>
          {(bySection.get("sorbet") ?? []).map((item) => (
            <FlavorCard key={item.id} item={item} />
          ))}
        </div>
        <div className="car-dots">
          {Array.from({
            length: Math.max(1, Math.ceil((bySection.get("sorbet") ?? []).length / 2)),
          }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`car-dot${sorbetCarousel.page === i ? " active" : ""}`}
              aria-label={`Sorbet page ${i + 1}`}
              onClick={() => sorbetCarousel.jump(i)}
            />
          ))}
        </div>
      </section>

      <section className="separator-video-section fade-in" aria-label="Decorative strip">
        {customSeparatorVideo ? (
          <InlineBackgroundVideo
            videoRef={separatorVideoRef}
            src={separatorVideoSrc}
            poster={separatorPosterSrc}
            className="separator-video separator-strip-video"
            preload="metadata"
          />
        ) : (
          <div className="separator-video separator-strip-fallback" aria-hidden />
        )}
      </section>

      <section className="follow-section fade-in" id="follow">
        <div className="follow-head">
          <div className="follow-title">FOLLOW US</div>
          <div className="follow-sub">ON INSTAGRAM</div>
        </div>
        <div className="insta-grid">
          {INSTA_LINKS.map((href, i) => (
            <a
              key={href + i}
              href={href}
              target="_blank"
              rel="nofollow noreferrer"
              className={`insta-photo${i === 2 ? " insta-active" : ""}`}
            >
              <Image
                src={INSTA_PHOTOS[i] ?? INSTA_PHOTOS[0]}
                alt="Anita Instagram"
                fill
                className="object-cover"
                sizes="(max-width: 500px) 33vw, 20vw"
              />
            </a>
          ))}
        </div>
        <div className="social-row">
          <a
            className="social-link"
            href="https://www.facebook.com/anitagelatotlv/"
            target="_blank"
            rel="nofollow noreferrer"
            aria-label="Facebook"
          >
            <span className="social-icon" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="37" viewBox="0 0 36 37" fill="none">
                <path d="M18 0.213c-9.666 0-17.5 8.057-17.5 18s7.834 18 17.5 18 17.5-8.057 17.5-18-7.834-18-17.5-18Zm4.549 10.863h-1.821c-1.429 0-1.703.698-1.703 1.724v2.258h3.406l-.446 3.538h-2.964v9.077h-3.551v-9.077h-2.968v-3.538h2.968v-2.61c0-3.029 1.798-4.675 4.424-4.675 1.257 0 2.339.098 2.655.141v3.162Z" fill="#5C502D"/>
              </svg>
            </span>
            <span className="social-lbl">FACEBOOK</span>
          </a>
          <a
            className="social-link"
            href="https://www.tiktok.com/@anitagelatola"
            target="_blank"
            rel="nofollow noreferrer"
            aria-label="TikTok"
          >
            <span className="social-icon" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M18.002.713C8.335.713.5 8.547.5 18.215c0 9.667 7.835 17.502 17.502 17.502 9.667 0 17.502-7.835 17.502-17.502C35.504 8.547 27.669.713 18.002.713Zm10.014 15.387c-2.023.091-3.807-.579-5.556-1.699.019.297.018.46.018.69 0 2.488.007 4.98-.004 7.468-.019 4.2-3.03 7.267-7.392 7.553-3.487.228-6.981-2.809-7.53-6.543-.655-4.462 3.113-8.627 7.614-8.41.244.012.488.061.77.099v3.967c-.214 0-.424.011-.633 0-2.031-.111-3.658 1.299-3.73 3.239-.069 1.848 1.387 3.452 3.201 3.521 2.054.076 3.635-1.36 3.647-3.41.027-4.981.011-9.958.011-14.939V6.52h3.986c.389 3.407 2.355 5.201 5.682 5.67v3.91Z" fill="#5C502D"/>
              </svg>
            </span>
            <span className="social-lbl">TIKTOK</span>
          </a>
          <a
            className="social-link"
            href="https://www.instagram.com/anitagelatousa/"
            target="_blank"
            rel="nofollow noreferrer"
            aria-label="Instagram"
          >
            <span className="social-icon" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="37" viewBox="0 0 36 37" fill="none">
                <path d="M26.217 11.976c-.194-.494-.424-.844-.793-1.214-.374-.37-.724-.6-1.221-.79-.374-.145-.938-.316-1.973-.363-1.12-.051-1.455-.062-4.286-.062-2.832 0-3.17.011-4.287.062-1.035.047-1.595.218-1.972.363-.494.19-.848.42-1.221.79-.37.37-.603.72-.794 1.214-.144.374-.319.93-.365 1.96-.051 1.113-.063 1.447-.063 4.264 0 2.816.012 3.15.063 4.263.046 1.027.221 1.587.365 1.96.194.494.424.844.794 1.214.373.37.723.6 1.22.79.374.144.939.315 1.973.362 1.12.05 1.455.062 4.287.062 2.831 0 3.17-.012 4.286-.062 1.035-.047 1.595-.218 1.973-.363.494-.19.848-.42 1.22-.79.37-.37.603-.72.794-1.214.144-.374.319-.93.365-1.96.051-1.113.063-1.447.063-4.263 0-2.817-.012-3.151-.063-4.264-.046-1.027-.218-1.587-.365-1.96Zm-8.274 11.638c-3.01 0-5.45-2.427-5.45-5.418 0-2.992 2.44-5.419 5.45-5.419s5.45 2.427 5.45 5.419c0 2.99-2.44 5.418-5.45 5.418Zm5.664-9.783a1.266 1.266 0 0 1-1.272-1.264c0-.696.572-1.268 1.272-1.268s1.272.568 1.272 1.268c0 .7-.568 1.264-1.272 1.264Z" fill="#5C502D"/>
                <path d="M17.944 14.68a3.526 3.526 0 0 0-3.536 3.516 3.526 3.526 0 0 0 3.536 3.515 3.526 3.526 0 0 0 3.535-3.515 3.526 3.526 0 0 0-3.535-3.515Z" fill="#5C502D"/>
                <path d="M17.998.213C8.06.213 0 8.273 0 18.211 0 28.149 8.06 36.21 17.998 36.21 27.937 36.21 36 28.15 36 18.211 36 8.273 27.94.213 17.998.213Zm10.49 22.335c-.05 1.124-.23 1.89-.494 2.56-.272.692-.634 1.284-1.225 1.867-.591.587-1.183.949-1.879 1.218-.677.26-1.447.439-2.575.49-1.132.05-1.494.062-4.376.062-2.883 0-3.245-.012-4.377-.063-1.128-.05-1.902-.228-2.575-.489-.696-.269-1.291-.631-1.879-1.218-.591-.587-.953-1.174-1.225-1.867-.26-.67-.443-1.44-.494-2.56-.05-1.124-.066-1.486-.066-4.349 0-2.863.012-3.225.066-4.35.05-1.124.23-1.89.494-2.56.272-.692.634-1.283 1.225-1.867.591-.587 1.182-.945 1.879-1.218.673-.26 1.447-.439 2.575-.49 1.132-.05 1.494-.061 4.377-.061 2.882 0 3.244.012 4.376.062 1.128.05 1.902.228 2.575.489.696.269 1.288.63 1.879 1.218.591.587.953 1.174 1.225 1.867.264.673.443 1.44.494 2.56.05 1.124.066 1.486.066 4.35 0 2.862-.012 3.224-.066 4.349Z" fill="#5C502D"/>
              </svg>
            </span>
            <span className="social-lbl">INSTAGRAM</span>
          </a>
        </div>
      </section>

      <footer className="footer fade-in">
        <div className="footer-badge-since">SINCE 2002</div>
        <div className="footer-badge-name">Anita Gelato</div>
        <div className="stamp-border">
          <div className="elementor-element-e22c923">
            <span className="footer-sub-head">CONTACT US</span>
            <form
              className="gform_wrapper gform-theme--no-framework footer-contact-form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (contactStatus === "sending" || contactStatus === "success") return;
                setContactStatus("sending");
                const fd = new FormData(e.currentTarget);
                try {
                  const supabase = createClient();
                  const { error } = await supabase.from("contact_submissions").insert({
                    name: fd.get("name") as string,
                    email: fd.get("email") as string,
                    subject: (fd.get("subject") as string) || null,
                    phone: (fd.get("phone") as string) || null,
                    country: (fd.get("country") as string) || null,
                    message: (fd.get("message") as string) || null,
                  });
                  if (error) throw error;
                  setContactStatus("success");
                  (e.target as HTMLFormElement).reset();
                } catch {
                  setContactStatus("error");
                }
              }}
            >
              <div className="gform-body">
                <div className="footer-form-grid">
                  <input className="footer-field" name="name" type="text" placeholder="NAME*" required />
                  <input className="footer-field" name="email" type="email" placeholder="EMAIL*" required />
                  <input className="footer-field" name="subject" type="text" placeholder="SUBJECT" />
                  <input className="footer-field" name="phone" type="tel" placeholder="PHONE*" required />
                </div>
                <input
                  className="footer-field footer-field-full"
                  name="country"
                  type="text"
                  placeholder="COUNTRY*"
                  required
                />
                <textarea
                  className="footer-field footer-field-full footer-textarea"
                  name="message"
                  placeholder="MESSAGE"
                  rows={4}
                />
                <label className="footer-consent">
                  <input type="checkbox" required />
                  <span>
                    I agree to the{" "}
                    <a href="https://www.anita-gelato.com/privacy-policy/" target="_blank" rel="noreferrer">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
              </div>
              {contactStatus === "success" && (
                <p className="footer-form-success">Thank you! Your message has been sent.</p>
              )}
              {contactStatus === "error" && (
                <p className="footer-form-error">Something went wrong. Please try again.</p>
              )}
              <div className="gform-footer">
                <button
                  type="submit"
                  className="footer-send-btn"
                  disabled={contactStatus === "sending" || contactStatus === "success"}
                >
                  {contactStatus === "sending" ? "SENDING…" : contactStatus === "success" ? "SENT ✓" : "SEND"}
                </button>
              </div>
            </form>
            <Image
              className="footer-contact-logo"
              src="https://www.anita-gelato.com/wp-content/uploads/2020/12/Isolation_Mode-1.svg"
              alt="Anita Gelato logo"
              width={100}
              height={126}
            />
          </div>
        </div>
        <div className="footer-plaid" />
        <div className="footer-copy">© {new Date().getFullYear()} Anita Gelato · Tarzana</div>
      </footer>
    </div>
  );
}

function FlavorCard({ item }: { item: MenuItemRow }) {
  const badge = item.is_new
    ? "new"
    : item.is_fave
      ? "fave"
      : item.is_vegan
        ? "vegan"
        : null;
  const badgeLabel = item.is_new ? "New" : item.is_fave ? "Fan Fave" : item.is_vegan ? "Vegan" : "";
  const imageUrl = getFlavorImageUrl(item);

  return (
    <div className="flav-card">
      <div className="flav-img">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 46vw, 190px"
          />
        ) : (
          <div className="flav-emoji">{item.emoji ?? "🍦"}</div>
        )}
        {badge && <div className={`flav-badge ${badge}`}>{badgeLabel}</div>}
      </div>
      <div className="flav-body">
        <div className="flav-name">{item.name}</div>
        <div className="flav-desc">{item.description}</div>
        {item.price_display && <div className="flav-price">{item.price_display}</div>}
      </div>
    </div>
  );
}
