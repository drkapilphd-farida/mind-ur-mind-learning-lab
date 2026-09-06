"use client";

import { Flame } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";
import { HABIT_BUILDER_APP_URL } from "@/config/habitBuilderSignupLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

const STREAK_DAYS = 21;
const STREAK_DAY_REACHED = 7;

// Featured Entry Point™ — the easiest, lowest-commitment way into the
// Mind Ur Mind ecosystem gets its own dedicated section (not just a card
// in the catalog below), per explicit instruction. No real Habit Builder
// product screenshot exists in this repo yet (confirmed — nothing under
// public/ matches), so rather than fabricating a fake mockup, the right
// column is an honest, real-data streak visual (day count and pricing
// pulled straight from the same verified copy as /programs/habit-builder,
// not fictional numbers) built from this site's own design tokens. Swap
// this panel for a real product screenshot once one is captured — see
// this component's own name for where.
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

        <div className="mx-auto w-full max-w-[400px] rounded-sm border border-line-strong bg-panel2 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-gold/50 bg-gold-soft">
              <Flame className="h-5 w-5 text-gold" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-ink">{section.streakVisualLabel}</p>
              <p className="text-[12px] text-ink-faint">{section.streakVisualCaption}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-1.5" aria-hidden="true">
            {Array.from({ length: STREAK_DAYS }, (_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-[2px] ${
                  index < STREAK_DAY_REACHED ? "bg-gold" : "border border-line-strong bg-panel"
                }`}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">Days 1–7</p>
              <p className="text-[14px] font-bold text-ink">{section.freeLabel}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">Days 8–21</p>
              <p className="text-[14px] font-bold text-gold">{section.priceLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
