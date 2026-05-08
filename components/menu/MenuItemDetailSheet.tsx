"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import {
  detailPricingTitle,
  detailSectionLabel,
  getPriceTiersForItem,
} from "@/lib/menu-item-detail";
import type { MenuItemRow, MenuSection } from "@/types/menu";

/** Portrait cone / tub shots — show full image in the sheet (no hard crop). */
function isFrozenHeroSection(section: MenuSection) {
  return section === "gelato" || section === "sorbet" || section === "yogurt" || section === "bestsellers" || section === "seasonal";
}

type MenuItemDetailSheetProps = {
  item: MenuItemRow;
  imageSrc: string | null;
  onClose: () => void;
};

export function MenuItemDetailSheet({ item, imageSrc, onClose }: MenuItemDetailSheetProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const tiers = getPriceTiersForItem(item);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const badge = item.is_new ? "New" : item.is_fave ? "Fan fave" : item.is_vegan ? "Vegan" : null;
  const frozenHero = isFrozenHeroSection(item.section);

  return (
    <div className="item-detail-root" role="presentation">
      <button
        type="button"
        className="item-detail-backdrop"
        aria-label="Close details"
        onClick={onClose}
      />
      <div
        className={`item-detail-sheet${frozenHero ? " item-detail-sheet--frozen-hero" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="item-detail-grab" aria-hidden />
        <button
          ref={closeRef}
          type="button"
          className="item-detail-close"
          onClick={onClose}
          aria-label="Close"
        >
          <span aria-hidden>×</span>
        </button>

        <div className={`item-detail-media${frozenHero ? " item-detail-media--frozen" : ""}`}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              className={frozenHero ? "object-contain object-center" : "object-cover object-center"}
              sizes="(max-width: 430px) 100vw, 430px"
              priority
            />
          ) : (
            <div className="item-detail-media-fallback">{item.emoji ?? "✦"}</div>
          )}
        </div>

        <div className="item-detail-body">
          <p className="item-detail-eyebrow">{detailSectionLabel(item.section)}</p>
          <h2 id={titleId} className="item-detail-title">
            {item.name}
          </h2>
          {badge ? <span className="item-detail-chip">{badge}</span> : null}
          {item.description?.trim() ? (
            <p className="item-detail-desc">{item.description.trim()}</p>
          ) : null}
          {item.promo_label?.trim() ? (
            <p className="item-detail-promo">{item.promo_label.trim()}</p>
          ) : null}

          <div className="item-detail-tiers-head">
            <span className="item-detail-tiers-label">{detailPricingTitle(item.section)}</span>
            <span className="item-detail-tiers-sub">In-store · subject to change</span>
          </div>
          <ul className="item-detail-tiers">
            {tiers.map((t) => (
              <li key={t.label + t.price} className="item-detail-tier">
                <div className="item-detail-tier-text">
                  <span className="item-detail-tier-name">{t.label}</span>
                  {t.hint ? <span className="item-detail-tier-hint">{t.hint}</span> : null}
                </div>
                <span className="item-detail-tier-price">{t.price}</span>
              </li>
            ))}
          </ul>

          <p className="item-detail-foot">
            Tap outside or swipe down to close · Ask our team for allergens &amp; pairings.
          </p>
        </div>
      </div>
    </div>
  );
}
