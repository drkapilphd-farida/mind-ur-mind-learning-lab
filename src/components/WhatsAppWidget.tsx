"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { WHATSAPP_GENERAL_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

type WhatsAppWidgetProps = {
  href?: string;
  bubble?: string;
  buttonLabel?: string;
  ariaLabel?: string;
  bottomClassName?: string;
  // Which page/placement rendered this widget (e.g. "qsr_widget",
  // "retreat_widget") — passed through to the whatsapp_click GA4 event so
  // conversion reports can tell the floating widget apart from the other
  // WhatsApp CTAs on the same page (FAQ, founder video). Left undefined
  // on the homepage's default (unbranded) usage.
  analyticsLocation?: string;
};

// Floating WhatsApp Widget™ — fixed to the viewport (outside <main>'s
// document flow) so it stays hyper-visible through every scroll depth,
// not just near the offers it's attached to. The text bubble is
// dismissible (not just decorative) so it doesn't permanently block
// content on small screens once the visitor has read it. Copy/link
// default to the homepage's general inquiry; dedicated program pages
// (e.g. the QSR landing page) override all four so the pre-filled
// WhatsApp message matches what the visitor is actually looking at, and
// override `bottomClassName` to clear their own sticky bottom CTA bar.
export default function WhatsAppWidget({
  href = WHATSAPP_GENERAL_INQUIRY_LINK,
  bubble,
  buttonLabel,
  ariaLabel,
  bottomClassName = "bottom-5 sm:bottom-7",
  analyticsLocation,
}: WhatsAppWidgetProps): React.JSX.Element {
  const { t } = useLanguage();
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  return (
    <div className={`fixed right-5 z-50 flex flex-col items-end gap-3 sm:right-7 ${bottomClassName}`}>
      {!bubbleDismissed && (
        <div className="relative max-w-[240px] rounded-sm border border-line-strong bg-panel2 p-4 text-[13px] leading-relaxed text-ink shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:max-w-[260px]">
          <button
            type="button"
            onClick={() => setBubbleDismissed(true)}
            aria-label="Dismiss"
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-ink-faint transition-colors hover:text-ink"
          >
            ×
          </button>
          <p className="pr-4">{bubble ?? t.whatsapp.bubble}</p>
        </div>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel ?? t.whatsapp.ariaLabel}
        onClick={() => trackGaEvent("whatsapp_click", { location: analyticsLocation ?? "widget" })}
        className="group flex items-center gap-2.5 rounded-full bg-[#25D366] py-3.5 pl-3.5 pr-5 text-[14px] font-semibold text-[#062112] shadow-[0_8px_30px_rgba(37,211,102,0.4)] transition-transform duration-200 hover:-translate-y-0.5"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 flex-none fill-current">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.16c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.34-.14-.2-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.57.17.29.75 1.24 1.61 2.01 1.11 1 2.05 1.31 2.33 1.46.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.1 1.66.79 1.95.93.29.14.48.21.55.33.07.12.07.68-.17 1.35Z" />
        </svg>
        {buttonLabel ?? t.whatsapp.button}
      </a>
    </div>
  );
}
