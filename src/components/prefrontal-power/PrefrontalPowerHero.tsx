"use client";

import { Eyebrow, CtaButton } from "../ui";
import FrequencyDial from "../FrequencyDial";
import { PREFRONTAL_POWER_REGISTRATION_URL } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// V2 — shorter, more concise, per explicit instruction ("the hero should
// be concise... do not lead with a large paragraph"). Still the
// typographic/FrequencyDial treatment (no photo) — that decision was
// already made explicitly earlier in this project (no suitable existing
// photo for a hero backdrop that wouldn't need awkward cropping or
// context-mismatch; every approved Dr. Kapil photo is already tied to
// one other specific section per the "one photo, one context" rule).
// Flagged in the delivery report in case a photo is wanted here instead.
export default function PrefrontalPowerHero(): React.JSX.Element {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line px-6 pb-16 pt-14 sm:px-8 sm:pt-20 lg:pb-24">
      <div
        className="pointer-events-none absolute -right-40 top-1/2 hidden w-[640px] -translate-y-1/2 opacity-70 md:block lg:-right-24 xl:right-0"
        aria-hidden="true"
      >
        <FrequencyDial />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">One-Day Brain Training Workshop</Eyebrow>
        </div>

        <p className="mt-6 text-[15px] font-bold uppercase tracking-[0.04em] text-ink">PREfrontal POWER</p>

        <h1 className="mt-3 text-[32px] font-extrabold uppercase leading-[1.14] tracking-tight sm:text-[44px] lg:text-[50px]">
          Train Your Brain.
          <br />
          Think Better. Live Better.
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-ink-dim">
          A practical, experiential workshop designed to help you understand attention, stress, emotional
          reactions and decision-making — and build mental skills you can continue practising in everyday
          life.
        </p>

        <p className="mx-auto mt-7 max-w-md font-mono text-[12.5px] uppercase tracking-[0.06em] text-ink-faint">
          27 September 2026 · Mumbai · 10:00 AM – 6:30 PM · ₹3,500
        </p>
        <p className="mt-1.5 font-mono text-[11.5px] font-semibold uppercase tracking-[0.06em] text-gold">
          Limited to 40 Participants
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <CtaButton
            href={PREFRONTAL_POWER_REGISTRATION_URL}
            variant="primary"
            accent="gold"
            openInNewTab
            onClick={() => trackGaEvent("whatsapp_click", { location: "prefrontal_power_hero" })}
          >
            Reserve My Seat
          </CtaButton>
          <a
            href="#experience"
            className="inline-flex items-center gap-2 rounded-sm border border-line-strong px-7 py-[15px] text-[14.5px] font-semibold text-ink transition-colors hover:bg-panel2"
          >
            Explore the Experience
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
