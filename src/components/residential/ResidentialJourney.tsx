"use client";

import { Compass, Flame, Sun, Moon, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const JOURNEY_ICONS = [Compass, Flame, Sun, Moon, CheckCircle2] as const;

// The retreat arc — grounding, activation, energy work, deep stillness,
// integration. Deliberately no fixed day-count claimed (unlike the live
// Sept 2026 Lonavala page's "7-Day" framing) since duration wasn't
// re-confirmed for these four 2026–27 dates.
export default function ResidentialJourney(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.residentialLanding.journey;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, index) => {
            const Icon = JOURNEY_ICONS[index % JOURNEY_ICONS.length] ?? Compass;
            return (
              <div key={item.title} className="rounded-sm border border-line bg-panel p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                  <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16.5px] font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
