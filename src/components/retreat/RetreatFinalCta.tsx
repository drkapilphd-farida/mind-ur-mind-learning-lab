"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import CheckoutTrustLine from "../CheckoutTrustLine";
import { RAZORPAY_RETREAT_PAYMENT_LINK } from "@/config/retreatPaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

export default function RetreatFinalCta(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.retreatLanding.finalCta;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
        </div>
        <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[36px]">{section.title}</h2>
        <p className="mx-auto mt-4 max-w-lg text-[15.5px] leading-relaxed text-ink-dim">{section.desc}</p>
        <div className="mt-9 flex justify-center">
          <a
            href={RAZORPAY_RETREAT_PAYMENT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("razorpay_checkout_click", { location: "retreat_final_cta" })}
            className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-8 py-[17px] text-[15px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
          >
            {section.cta}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>
        <CheckoutTrustLine className="mx-auto mt-3 max-w-xs text-center" />
      </div>
    </section>
  );
}
