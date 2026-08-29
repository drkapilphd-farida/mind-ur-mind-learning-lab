"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from "@/config/masterclassPaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Sticky Conversion Footer™ — stays off-screen (translated down, not
// unmounted, so the transition is smooth) until the visitor scrolls past
// the hero's own CTA, then slides up. Showing it immediately would just
// duplicate the hero button in view; showing it only after the visitor
// has scrolled is what makes it a genuine "you're still deciding, here's
// the ask again" prompt rather than noise.
const SCROLL_REVEAL_THRESHOLD_PX = 560;

export default function QsrStickyBar(): React.JSX.Element {
  const { t } = useLanguage();
  const qsr = t.qsrLanding;
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
          <p className="truncate text-[13.5px] font-semibold text-ink">{qsr.stickyBar.text}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">{qsr.stickyBar.price}</p>
        </div>
        <a
          href={RAZORPAY_MASTERCLASS_PAYMENT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGaEvent("razorpay_checkout_click", { location: "qsr_sticky_bar" })}
          className="inline-flex flex-none items-center gap-2 rounded-sm bg-gold px-5 py-2.5 text-[13.5px] font-semibold text-[#1B1508] transition-transform hover:-translate-y-0.5 hover:bg-[#cb9a44]"
        >
          {qsr.stickyBar.cta}
        </a>
      </div>
    </div>
  );
}
