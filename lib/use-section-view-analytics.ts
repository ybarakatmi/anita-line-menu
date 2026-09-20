"use client";

import { pushAnalyticsEvent } from "@/lib/gtm";
import { useEffect, useRef } from "react";

/**
 * Fire `section_view` once per section when ~50% visible (GTM → GA4).
 * `onSectionSeen` runs at the same moment so callers can emit the matching
 * GA4 `view_item_list` without a second observer.
 */
export function useSectionViewAnalytics(
  sectionIds: string[],
  onSectionSeen?: (sectionId: string) => void
) {
  const idsKey = sectionIds.join("|");

  // Kept in a ref so a new inline callback each render does not re-create the observer
  // and re-fire every section the customer has already scrolled past.
  const onSeenRef = useRef(onSectionSeen);
  useEffect(() => {
    onSeenRef.current = onSectionSeen;
  }, [onSectionSeen]);

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
          onSeenRef.current?.(id);
        }
      },
      { threshold: [0.5] }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [idsKey, sectionIds]);
}
