"use client";

import { BookOpenText, Rocket, Users, Presentation } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const CARD_ICONS = [BookOpenText, Rocket, Users, Presentation] as const;

// Authority Cards™ — a dedicated, high-visibility credential grid (as
// opposed to the compact hero credentials chip row), placed right before
// the founder video so the visitor has the full case for why Dr. Kapil
// is credible before hearing from him directly. Pioneer card is the
// centerpiece: the whole point is "learn from the originator," not just
// "learn from someone qualified."
export default function QsrAuthority(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.authority;

  // Visual Rhythm™ — lg:py-16 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section id="authority" className="border-b border-line bg-panel px-6 py-24 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.cards.map((card, index) => {
            const Icon = CARD_ICONS[index % CARD_ICONS.length] ?? BookOpenText;
            const isPioneer = index === 1;
            return (
              <div
                key={card.title}
                className={`rounded-sm border p-6 ${
                  isPioneer ? "border-gold/50 bg-panel2" : "border-line bg-panel2"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                    isPioneer ? "border-gold bg-gold-soft" : "border-gold/40 bg-gold-soft"
                  }`}
                >
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
