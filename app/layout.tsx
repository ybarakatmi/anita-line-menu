import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { GoogleTagManagerNoScript } from "@/components/analytics/GoogleTagManagerNoScript";
import { MicrosoftClarity } from "@/components/analytics/MicrosoftClarity";
import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Josefin_Sans } from "next/font/google";
import "./globals.css";

const serif = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const sans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anita Gelato — Tarzana Menu",
  description: "Browse seasonal flavors, gelato, sorbets, coffee, and more.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#b8a572" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Anita Menu",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#fce8e0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <MicrosoftClarity />
      </head>
      <body
        className={`${serif.variable} ${sans.variable} antialiased`}
        style={
          {
            ["--serif" as string]: "var(--font-bodoni), Georgia, serif",
            ["--sans" as string]: "var(--font-josefin), system-ui, sans-serif",
          } as React.CSSProperties
        }
      >
        {/* Google Tag Manager (noscript) — immediately after <body> per GTM install guide */}
        <GoogleTagManagerNoScript />
        {children}
        <GoogleTagManager />
      </body>
    </html>
  );
}
