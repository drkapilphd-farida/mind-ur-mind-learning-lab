"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { RAZORPAY_RETREAT_PAYMENT_LINK } from "@/config/retreatPaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Same scroll-reveal pattern as QsrStickyBar.tsx — stays off-screen until
// the visitor scrolls past the hero's own CTA, so it doesn't just
// duplicate what's already in view.
const SCROLL_REVEAL_THRESHOLD_PX = 560;

export default function RetreatStickyBar(): React.JSX.Element {
  const { t } = useLanguage();
  const retreat = t.retreatLanding;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setVisible(window.scrollY > SCROLL_REVEAL_THRESHOLD_PX);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line-strong bg-void/95 backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-8">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold text-ink">{retreat.stickyBar.text}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">{retreat.stickyBar.price}</p>
        </div>
        <a
          href={RAZORPAY_RETREAT_PAYMENT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGaEvent("razorpay_checkout_click", { location: "retreat_sticky_bar" })}
          className="inline-flex flex-none items-center gap-2 rounded-sm bg-gold px-5 py-2.5 text-[13.5px] font-semibold text-[#1B1508] transition-transform hover:-translate-y-0.5 hover:bg-[#cb9a44]"
        >
          {retreat.stickyBar.cta}
        </a>
      </div>
    </div>
  );
}
