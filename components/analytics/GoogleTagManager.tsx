"use client";

import { GTM_ID } from "@/lib/analytics-ids";
import Script from "next/script";
import { usePathname } from "next/navigation";

function shouldLoadGtm(pathname: string | null): boolean {
  if (!GTM_ID) return false;
  if (!pathname) return true;
  return !pathname.startsWith("/admin");
}

/** GTM script — public menu only (not /admin). */
export function GoogleTagManager() {
  const pathname = usePathname();
  if (!shouldLoadGtm(pathname)) return null;

  return (
    <Script id="google-tag-manager" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
    </Script>
  );
}

