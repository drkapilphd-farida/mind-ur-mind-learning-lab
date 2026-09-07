"use client";

import { CtaButton } from "../ui";
import { PREFRONTAL_POWER_REGISTRATION_URL } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

export default function PrefrontalPowerFinalCta(): React.JSX.Element {
  return (
    <section className="border-b border-line bg-panel px-6 py-20 text-center sm:px-8 sm:py-24">
      <div className="mx-auto max-w-xl">
        <h2 className="text-[28px] font-extrabold uppercase leading-tight sm:text-[36px]">
          Ready to Train Your Brain?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15.5px] leading-relaxed text-ink-dim">
          You don&apos;t need more information. You need a better way to use what you already know.
        </p>

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
