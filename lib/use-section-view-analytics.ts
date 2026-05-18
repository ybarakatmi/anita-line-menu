"use client";

import { pushAnalyticsEvent } from "@/lib/gtm";
import { useEffect } from "react";

const SECTION_IDS = [
  "seasonal",
  "bestsellers",
  "coffee",
  "pastries",
  "drinks",
  "yogurt",
  "gelato",
  "sorbet",
] as const;

/** Fire `section_view` once per section when ~50% visible (GTM → GA4). */
export function useSectionViewAnalytics() {
  useEffect(() => {
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
          const id = entry.target.id;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          pushAnalyticsEvent("section_view", { section_id: id });
        }
      },
      { threshold: [0.5] }
    );

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);
}
