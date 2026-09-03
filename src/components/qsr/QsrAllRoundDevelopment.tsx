"use client";

import { BookOpen, Wind, Target, Users, Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const ITEM_ICONS = [BookOpen, Wind, Target, Users] as const;

export default function QsrAllRoundDevelopment(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.allRoundDevelopment;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => {
            const Icon = ITEM_ICONS[index % ITEM_ICONS.length] ?? BookOpen;
            return (
              <div key={item.title} className="rounded-sm border border-line-strong bg-panel2 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-7 flex max-w-2xl items-start gap-3 rounded-sm border border-line-strong bg-panel2 px-5 py-4">
          <Info className="mt-0.5 h-4 w-4 flex-none text-ink-faint" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-ink-dim">{section.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
