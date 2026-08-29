import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/ga4";

// Renders nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset (no real
// ID has been provided for this project) — gtag.js is never fetched and
// window.gtag never exists, which is exactly what trackGaEvent's no-op
// guard expects.
export default function GoogleAnalytics(): React.JSX.Element | null {
  if (GA_MEASUREMENT_ID === undefined || GA_MEASUREMENT_ID === "") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
