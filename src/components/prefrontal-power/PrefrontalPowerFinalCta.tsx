"use client";

import { CtaButton } from "../ui";
import { PREFRONTAL_POWER_REGISTRATION_URL } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

export default function PrefrontalPowerFinalCta(): React.JSX.Element {
  return (
    <section className="border-b border-line px-6 py-20 text-center sm:px-8 sm:py-24">
      <div className="mx-auto max-w-xl">
        <h2 className="text-[24px] font-extrabold uppercase leading-tight sm:text-[30px]">
          You Don&apos;t Need More Information.
          <br />
          <span className="text-gold">You Need a Better Way to Use What You Already Know.</span>
        </h2>

        <div className="mx-auto mt-8 max-w-xs border-y border-line-strong py-4">
          <p className="text-[15px] font-bold uppercase tracking-[0.02em] text-ink">PREfrontal POWER</p>
          <p className="mt-1 text-[13px] text-ink-dim">Train Your Brain. Think Better. Live Better.</p>
        </div>

        <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.05em] text-ink-faint">
          27 September 2026 · Mumbai · ₹3,500 · Limited to 40 Participants
        </p>

        <div className="mt-8 flex justify-center">
          <CtaButton
            href={PREFRONTAL_POWER_REGISTRATION_URL}
            variant="primary"
            accent="gold"
            openInNewTab
            onClick={() => trackGaEvent("whatsapp_click", { location: "prefrontal_power_final_cta" })}
          >
            Reserve My Seat
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
