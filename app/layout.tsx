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
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
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
  themeColor: "#faf7f2",
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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
