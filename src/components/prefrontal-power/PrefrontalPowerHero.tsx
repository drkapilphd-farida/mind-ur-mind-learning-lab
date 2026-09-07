"use client";

import { Eyebrow, CtaButton } from "../ui";
import FrequencyDial from "../FrequencyDial";
import { PREFRONTAL_POWER_REGISTRATION_URL } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Typographic Hero™ — no photo exists that fits a workshop hero (only
// founder/mentor portraits, already doing other jobs elsewhere on the
// site — see the Trainer section for where dr-kapil-learning.png.png is
// used instead), and no in-person event photography exists anywhere in
// this codebase yet (confirmed: every GALLERY_PHOTOS slot is empty).
// Per explicit direction, this reuses FrequencyDial.tsx — the same
// abstract line-art motif already anchoring the homepage's own hero —
// rather than inventing new brand iconography or reaching for a stock
// photo of a person meditating/thinking.
export default function PrefrontalPowerHero(): React.JSX.Element {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line px-6 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pb-28">
      <div
        className="pointer-events-none absolute -right-40 top-1/2 hidden w-[640px] -translate-y-1/2 opacity-70 md:block lg:-right-24 xl:right-0"
        aria-hidden="true"
      >
        <FrequencyDial />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">ONE-DAY BRAIN TRAINING WORKSHOP · MUMBAI</Eyebrow>
        </div>

        <h1 className="mt-6 text-[34px] font-extrabold uppercase leading-[1.12] tracking-tight sm:text-[46px] lg:text-[52px]">
          Your Brain Is Your Biggest Performance Tool.
        </h1>
        <p className="mt-4 font-display text-[20px] italic leading-relaxed text-ink-dim sm:text-[23px]">
          But nobody ever taught you how to train it.
        </p>

        <div className="mx-auto mt-9 max-w-md border-y border-line-strong py-5">
          <p className="text-[17px] font-bold uppercase tracking-[0.02em] text-ink">PREfrontal POWER</p>
          <p className="mt-1 text-[13.5px] text-ink-dim">Train Your Brain. Think Better. Live Better.</p>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
          A practical, experiential day designed around how attention, stress and decision-making actually
          work — so you leave with mental skills you can practise long after the workshop ends. Not a lecture.
          Not a retreat. A brain-training experience.
        </p>

        <p className="mx-auto mt-7 max-w-lg font-mono text-[12.5px] uppercase tracking-[0.06em] text-ink-faint">
          27 September 2026 · Mumbai · 10:00 AM – 6:30 PM
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> · </span>
          ₹3,500 per participant · Limited to 40 seats
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
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
            href="#problem"
            className="inline-flex items-center gap-2 rounded-sm border border-line-strong px-7 py-[15px] text-[14.5px] font-semibold text-ink transition-colors hover:bg-panel2"
          >
            Explore the Workshop
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
