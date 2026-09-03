"use client";

import Link from "next/link";
import { Eye, Timer, PhoneOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const TIP_ICONS = [Eye, Timer, PhoneOff] as const;

// Quantum Mindset & Habit Builder™ cross-sell — links to its real,
// public, logged-out-accessible landing page (/programs/habit-builder,
// built separately). Previously text-only with no CTA, since that page
// didn't exist yet and the product's real UI lived entirely behind
// /labs/quantum-speed-reading/journey/*, which middleware.ts gates
// behind login.
export default function QsrFocusScreenTime(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.focusInDistractedWorld;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-10 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.intro}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {section.tips.map((tip, index) => {
            const Icon = TIP_ICONS[index % TIP_ICONS.length] ?? Eye;
            return (
              <div key={tip.title} className="rounded-sm border border-line bg-panel2 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                  <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{tip.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{tip.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-start gap-5 rounded-sm border border-teal/30 bg-teal-soft p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-teal">
              {section.habitAppCard.eyebrow}
            </span>
            <h3 className="mb-2 mt-2 text-[19px] font-bold leading-snug text-ink">{section.habitAppCard.title}</h3>
            <p className="max-w-xl text-[14px] leading-relaxed text-ink-dim">{section.habitAppCard.desc}</p>
            <p className="mt-2 text-[13.5px] font-semibold text-teal">{section.habitAppCard.price}</p>
          </div>
          <Link
            href="/programs/habit-builder"
            className="inline-flex flex-none items-center gap-2.5 whitespace-nowrap rounded-sm border border-teal/60 bg-panel px-7 py-[15px] text-[14.5px] font-semibold text-teal transition-colors hover:bg-teal hover:text-white"
          >
            {section.habitAppCard.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
