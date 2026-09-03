"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { HABIT_BUILDER_SIGNUP_HREF } from "@/config/habitBuilderSignupLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

export default function HabitBuilderPricing(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.habitBuilderLanding.pricing;

  return (
    <section id="pricing" className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-sm border border-line-strong bg-panel2 p-7 sm:p-8">
            <p className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink-faint">{section.freeCard.label}</p>
            <p className="mt-2 text-[32px] font-extrabold tabular-nums text-ink">{section.freeCard.price}</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-dim">{section.freeCard.desc}</p>
          </div>

          <div className="rounded-sm border border-gold/40 bg-panel2 p-7 sm:p-8">
            <p className="font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink-faint">{section.paidCard.label}</p>
            <p className="mt-2 text-[32px] font-extrabold tabular-nums text-gold">{section.paidCard.price}</p>
            <p className="mt-1 text-[12px] font-semibold text-ink-faint">{section.paidCard.priceNote}</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-dim">{section.paidCard.desc}</p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={HABIT_BUILDER_SIGNUP_HREF}
            onClick={() => trackGaEvent("signup_cta_click", { location: "habit_builder_pricing" })}
            className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
          >
            {section.cta}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
