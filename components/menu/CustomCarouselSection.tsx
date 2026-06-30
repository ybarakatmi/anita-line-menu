"use client";

import Image from "next/image";
import { SectionHead } from "@/components/menu/SectionHead";
import type { MenuItemRow, MenuSectionRow, SiteSettingsRow } from "@/types/menu";
import { useCallback, useEffect, useRef, useState } from "react";

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

  const jump = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".flav-card") as HTMLElement | null;
    const w = (card?.offsetWidth ?? 150) + 12;
    track.scrollTo({ left: i * w * 2, behavior: "smooth" });
  }, []);

  return { trackRef, page, jump };
}

function CarouselCard({
  item,
  onOpenDetail,
}: {
  item: MenuItemRow;
  onOpenDetail: (item: MenuItemRow) => void;
}) {
  const badge = item.is_new ? "new" : item.is_fave ? "fave" : item.is_vegan ? "vegan" : null;
  const badgeLabel = item.is_new ? "New" : item.is_fave ? "Fan Fave" : item.is_vegan ? "Vegan" : "";
  const imageUrl = item.image_url?.trim() || null;

  return (
    <button
      type="button"
      className="flav-card flav-card--btn"
      onClick={() => onOpenDetail(item)}
      aria-label={`${item.name}. Open details and pricing.`}
    >
      <div className="flav-img">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
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
    </button>
  );
}

type Props = {
  section: MenuSectionRow;
  settings: SiteSettingsRow;
  items: MenuItemRow[];
  onOpenDetail: (item: MenuItemRow) => void;
  className?: string;
};

export function CustomCarouselSection({ section, settings, items, onOpenDetail, className }: Props) {
  const carousel = useCarouselTrack();

  useEffect(() => {
    carousel.trackRef.current?.scrollTo({ left: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((g) => g.id).join("|")]);

  if (!items.length) return null;

  return (
    <section
      className={`menu-section sage-bg fade-in new-products-section${className ? ` ${className}` : ""}`}
      id={section.id}
    >
      <SectionHead section={section} settings={settings} />
      <div className="car-track" ref={carousel.trackRef}>
        {items.map((item) => (
          <CarouselCard key={item.id} item={item} onOpenDetail={onOpenDetail} />
        ))}
      </div>
      <div className="car-dots">
        {Array.from({ length: Math.max(1, Math.ceil(items.length / 2)) }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`car-dot${carousel.page === i ? " active" : ""}`}
            aria-label={`${section.label} page ${i + 1}`}
            onClick={() => carousel.jump(i)}
          />
        ))}
      </div>
    </section>
  );
}
