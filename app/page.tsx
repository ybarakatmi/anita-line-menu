import { MenuBoard } from "@/components/menu/MenuBoard";
import { getMenuData } from "@/lib/get-menu-data";
import { resolvePublicOrigin, toAbsoluteMediaUrl } from "@/lib/resolve-public-origin";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// A brand image used as fallback poster / OG image for link previews.
const OG_FALLBACK_IMAGE =
  "https://www.anita-gelato.com/wp-content/uploads/2024/06/Ice-Cream-Table-768x960.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const origin = await resolvePublicOrigin();
  const siteUrl = origin ?? "https://www.anitagelatola.net";
  const videoUrl = toAbsoluteMediaUrl(siteUrl, "/hero.mp4");

  return {
    title: "Anita Gelato — Tarzana Menu",
    description:
      "Handcrafted gelato, sorbets, Italian coffee, pastries & more. Browse our full menu for the Tarzana, Los Angeles location.",
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: "Anita Gelato — Tarzana",
      description:
        "Handcrafted gelato, sorbets, Italian coffee, pastries & more.",
      url: siteUrl,
      siteName: "Anita Gelato Tarzana",
      type: "website",
      images: [
        {
          url: OG_FALLBACK_IMAGE,
          width: 768,
          height: 960,
          alt: "Anita Gelato ice cream selection",
        },
      ],
      videos: [
        {
          url: videoUrl,
          type: "video/mp4",
          width: 1280,
          height: 720,
        },
      ],
    },
    twitter: {
      card: "player",
      title: "Anita Gelato — Tarzana Menu",
      description: "Handcrafted gelato, sorbets, Italian coffee & more.",
      images: [OG_FALLBACK_IMAGE],
      players: [
        {
          playerUrl: `${siteUrl}/hero-player`,
          streamUrl: videoUrl,
          width: 1280,
          height: 720,
        },
      ],
    },
  };
}

export default async function HomePage() {
  const data = await getMenuData();
  return (
    <MenuBoard
      initialItems={data.items}
      initialSettings={data.settings}
      mode={data.mode}
    />
  );
}
