"use client";

import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { buildResidentialWhatsAppLink } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Real pricing, given directly by the business owner: ₹35,000/person
// sharing, ₹45,000/person private — flat across all four 2026–27 dates.
// No Razorpay checkout exists for this offer, so each tier's CTA opens
// WhatsApp with the tier pre-filled, matching the real, existing booking
// flow (seats confirmed personally by the team) rather than a fabricated
// instant-checkout button.
export default function ResidentialPricing(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.residentialLanding.pricing;

  return (
    <section id="pricing" className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {section.tiers.map((tier) => (
            <div key={tier.name} className="flex flex-col rounded-sm border border-line-strong bg-panel2 p-7 sm:p-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold">{tier.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[32px] font-extrabold text-ink">{tier.price}</span>
                <span className="text-[13px] text-ink-faint">{tier.priceNote}</span>
              </div>

              <div className="mt-6 flex-1 space-y-3 border-t border-line-strong pt-6">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-gold" aria-hidden="true" />
                    <p className="text-[13.5px] leading-relaxed text-ink">{feature}</p>
                  </div>
                ))}
              </div>

              <a
                href={buildResidentialWhatsAppLink(`${tier.name} — ${tier.price} ${tier.priceNote}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGaEvent("whatsapp_click", { location: `residential_pricing_${tier.name}` })}
                className="group mt-7 inline-flex items-center justify-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
              >
                {tier.cta}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-[13px] leading-relaxed text-ink-faint">
          {section.note}
        </p>
      </div>
    </section>
  );
}
