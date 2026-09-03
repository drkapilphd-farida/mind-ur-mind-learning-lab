"use client";

import { Flame, ClipboardCheck, MessageCircle, Award } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const BENEFIT_ICONS = [Flame, ClipboardCheck, MessageCircle, Award] as const;

// Only real, shipped features — no XP/points/badges/leaderboard, none of
// which are user-facing today (confirmed in the earlier code audit;
// XP is computed and saved but never displayed anywhere in the app).
export default function HabitBuilderBenefits(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.habitBuilderLanding.benefits;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => {
            const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length] ?? Flame;
            return (
              <div key={item.title} className="rounded-sm border border-line bg-panel2 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                  <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
