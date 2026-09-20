import Script from "next/script";

/**
 * Google Consent Mode v2 defaults.
 *
 * Must run BEFORE the GTM snippet, or tags fire once with no consent state and
 * Google's behavioural modelling never kicks in. next/script "beforeInteractive"
 * in the root layout is what guarantees that ordering.
 *
 * Anita's is a walk-up counter in Tarzana, so the overwhelming majority of scans
 * are US foot traffic: those get granted defaults and never see a banner. EEA/UK
 * visitors start denied and are asked, via ConsentBanner.
 */
const EEA_UK_REGIONS = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT",
  "LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
  "IS","LI","NO","GB","CH",
];

export function ConsentMode() {
  return (
    <Script id="consent-mode-defaults" strategy="beforeInteractive">
      {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','functionality_storage':'denied','personalization_storage':'denied','security_storage':'granted','wait_for_update':500,'region':${JSON.stringify(
        EEA_UK_REGIONS
      )}});
gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'granted','functionality_storage':'granted','personalization_storage':'granted','security_storage':'granted'});
try{var s=localStorage.getItem('anita_consent');if(s==='granted'){gtag('consent','update',{'analytics_storage':'granted','functionality_storage':'granted','personalization_storage':'granted'});}else if(s==='denied'){gtag('consent','update',{'analytics_storage':'denied','functionality_storage':'denied','personalization_storage':'denied'});}}catch(e){}
gtag('set','ads_data_redaction',true);`}
    </Script>
  );
}
