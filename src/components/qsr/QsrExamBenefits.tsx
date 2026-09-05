"use client";

import { Landmark, FlaskConical, GraduationCap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const CARD_ICONS = [Landmark, FlaskConical, GraduationCap] as const;

// Subject-Wise Benefits™ — deliberately qualitative/directional claims
// only (no invented percentages or stat placeholders), matching the
// same honesty discipline as every other claim on this page.
export default function QsrExamBenefits(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.examBenefits;

  // Visual Rhythm™ — lg:py-16 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section className="border-b border-line px-6 py-24 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {section.cards.map((card, index) => {
            const Icon = CARD_ICONS[index % CARD_ICONS.length] ?? Landmark;
            return (
              <div key={card.title} className="rounded-sm border border-line bg-panel2 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{card.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
