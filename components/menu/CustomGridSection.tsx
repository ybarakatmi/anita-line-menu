"use client";

import Image from "next/image";
import { SectionHead } from "@/components/menu/SectionHead";
import type { MenuItemRow, MenuSectionRow, SiteSettingsRow } from "@/types/menu";

type Props = {
  section: MenuSectionRow;
  settings: SiteSettingsRow;
  items: MenuItemRow[];
  onOpenDetail: (item: MenuItemRow) => void;
  className?: string;
};

export function CustomGridSection({ section, settings, items, onOpenDetail, className }: Props) {
  if (!items.length) return null;

  return (
    <section
      className={`menu-section blush-bg fade-in${className ? ` ${className}` : ""}`}
      id={section.id}
    >
      <SectionHead section={section} settings={settings} />
      <div className="drinks-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="drink-card drink-card--btn"
            onClick={() => onOpenDetail(item)}
            aria-label={`${item.name}. Open details and pricing.`}
          >
            {item.image_url?.trim() ? (
              <div className="drink-card-photo">
                <Image
                  src={item.image_url}
                  alt=""
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
          </button>
        ))}
      </div>
    </section>
  );
}
