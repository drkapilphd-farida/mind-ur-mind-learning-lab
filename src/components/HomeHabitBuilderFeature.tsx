"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";
import { HABIT_BUILDER_APP_URL } from "@/config/habitBuilderSignupLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Real, approved screenshots of the live app (public/habit_*_clean.png) —
// no mockups, no fabricated UI. One dominant "hero" screenshot (the
// dashboard) plus four smaller supporting screenshots from elsewhere in
// the real 21-day flow, deliberately unequal in size so this reads as one
// product showcase, not five equal gallery tiles.
const SECONDARY_SCREENSHOTS = [
  { src: "/habit_program_intro_clean.png", ratio: 591 / 1125, labelKey: "programIntro" as const },
  { src: "/habit_day1_complete_clean.png", ratio: 591 / 1015, labelKey: "day1Complete" as const },
  { src: "/habit_box_breathing_clean.png", ratio: 591 / 1015, labelKey: "boxBreathing" as const },
  { src: "/habit_reading_mode_clean.png", ratio: 591 / 1015, labelKey: "readingMode" as const },
];

// Featured Entry Point™ — the easiest, lowest-commitment way into the
// Mind Ur Mind ecosystem gets its own dedicated section (not just a card
// in the catalog below), per explicit instruction.
export default function HomeHabitBuilderFeature(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.homeHabitFeature;

  return (
    <section className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-content grid-cols-1 gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[36px]">{section.title}</h2>
          <p className="mt-5 text-[16px] font-semibold leading-relaxed text-ink">{section.lead}</p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-dim">{section.desc}</p>

          <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">Days 1–7</p>
              <p className="mt-1 text-[26px] font-extrabold text-ink">{section.freeLabel}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">Days 8–21</p>
              <p className="mt-1 text-[26px] font-extrabold text-gold">{section.priceLabel}</p>
            </div>
          </div>
          <p className="mt-2 text-[13px] text-ink-faint">{section.noSubscriptionLabel}</p>

          <a
            href={HABIT_BUILDER_APP_URL}
            onClick={() => trackGaEvent("signup_cta_click", { location: "home_habit_feature" })}
            className="group mt-8 inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
          >
            {section.cta}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>

        <div className="mx-auto w-full max-w-[420px]">
          {/* Main visual — the dashboard, dominant */}
          <div className="relative mx-auto w-[230px] overflow-hidden rounded-[20px] border border-line-strong bg-panel p-1.5 shadow-[0_24px_50px_rgba(34,31,29,0.16)] sm:w-[250px]">
            <div className="relative aspect-[738/1270] w-full overflow-hidden rounded-[14px]">
              <Image
                src="/habit_dashboard_clean.png"
                alt={section.mainScreenshotAlt}
                fill
                sizes="250px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Secondary visuals — smaller, supporting, captioned */}
          <div className="mx-auto mt-6 grid max-w-[380px] grid-cols-4 gap-3">
            {SECONDARY_SCREENSHOTS.map((shot) => (
              <div key={shot.src} className="text-center">
                <div className="overflow-hidden rounded-[10px] border border-line-strong bg-panel p-1 shadow-[0_8px_20px_rgba(34,31,29,0.1)]">
                  <div className="relative w-full overflow-hidden rounded-[6px]" style={{ aspectRatio: shot.ratio }}>
                    <Image
                      src={shot.src}
                      alt={section.screenshotLabels[shot.labelKey]}
                      fill
                      sizes="90px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <p className="mt-1.5 font-mono text-[9px] uppercase leading-tight tracking-[0.03em] text-ink-faint">
                  {section.screenshotLabels[shot.labelKey]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
