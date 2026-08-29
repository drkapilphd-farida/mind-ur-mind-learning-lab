"use client";

import { Radio, ScanEye, Flower2, Sun, Flame, Orbit } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const DISCIPLINE_ICONS = [Radio, ScanEye, Flower2, Sun, Flame, Orbit] as const;

export default function RetreatDisciplines(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.retreatLanding.disciplines;

  return (
    <section id="disciplines" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, index) => {
            const Icon = DISCIPLINE_ICONS[index % DISCIPLINE_ICONS.length] ?? Radio;
            return (
              <div key={item.title} className="rounded-sm border border-line bg-panel p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
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
