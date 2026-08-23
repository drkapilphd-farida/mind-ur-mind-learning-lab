"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";

export default function HabitAppStrip(): React.JSX.Element {
  const { t } = useLanguage();
  const tier = t.tier4;

  return (
    <section id="tier-4" className="border-b border-line px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="flex flex-col items-start justify-between gap-8 rounded-sm border border-dashed border-line-strong px-8 py-9 sm:flex-row sm:items-center sm:px-10">
          <div className="max-w-xl">
            <Eyebrow color="text-teal">{tier.eyebrow}</Eyebrow>
            <h3 className="mt-3 text-[19px] font-bold text-ink sm:text-[21px]">{tier.title}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-dim">{tier.desc}</p>
          </div>
          <a
            href="/app/habit-app"
            className="group inline-flex flex-none items-center gap-2.5 rounded-sm border border-teal/60 px-7 py-[15px] text-[14.5px] font-semibold text-teal transition-colors hover:bg-teal-soft"
          >
            {tier.cta}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
