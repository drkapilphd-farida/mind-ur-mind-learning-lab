"use client";

import { BookOpen, Gauge, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";
import { HABIT_BUILDER_APP_URL } from "@/config/habitBuilderSignupLink";

const PATH_ICONS: Record<string, LucideIcon> = {
  habit: Gauge,
  reading: BookOpen,
  retreats: Sparkles,
  mentoring: UserRound,
};

const PATH_HREFS: Record<string, string> = {
  habit: HABIT_BUILDER_APP_URL,
  reading: "/programs/quantum-speed-reading",
  retreats: "/retreats/online-11-day",
  mentoring: "/mentoring/personal-class",
};

// Choice Architecture™ — four real pathways, not five competing products.
// Each card answers "which reason brought you here," not "which course
// should I buy" — one icon, one eyebrow naming the reason, one program
// name, one line, and (only for Habit Builder, the free entry point) the
// price line, so the free path visibly stands apart from the rest without
// a louder visual treatment than the others need. The Habit Builder path
// links straight to the live app subdomain (HABIT_BUILDER_APP_URL); the
// other three link to their own real landing pages on this site.
export default function ProgramSelector(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.programSelector;

  return (
    <section id="begin" className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-[26px] font-extrabold leading-tight sm:text-[32px]">{section.title}</h2>
          <p className="mt-3 text-[15px] text-ink-dim">{section.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {section.paths.map((path) => {
            const Icon = PATH_ICONS[path.key] ?? BookOpen;
            const isHabit = path.key === "habit";
            return (
              <a
                key={path.key}
                href={PATH_HREFS[path.key] ?? "#"}
                className={`group flex flex-col rounded-sm border p-7 transition-all duration-200 hover:-translate-y-1 sm:p-8 ${
                  isHabit
                    ? "border-gold/50 bg-gold-soft/20 hover:border-gold hover:shadow-[0_16px_36px_rgba(184,134,46,0.16)]"
                    : "border-line-strong bg-panel2 hover:border-ink-dim hover:shadow-[0_16px_36px_rgba(34,31,29,0.08)]"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                    isHabit ? "border-gold/50 bg-gold-soft" : "border-teal/40 bg-teal-soft"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isHabit ? "text-gold" : "text-teal"}`} aria-hidden="true" />
                </div>
                <Eyebrow color={isHabit ? "text-gold" : "text-ink-faint"}>{path.eyebrowLabel}</Eyebrow>
                <h3 className="mt-4 text-[18px] font-bold leading-snug text-ink">{path.title}</h3>
                <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-dim">{path.desc}</p>
                {path.priceLine !== undefined && (
                  <p className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.05em] text-gold">{path.priceLine}</p>
                )}
                <span
                  className={`mt-5 inline-flex items-center gap-2 text-[13.5px] font-semibold ${
                    isHabit ? "text-gold" : "text-ink"
                  }`}
                >
                  {path.cta}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
