"use client";

import { BookOpen, Repeat, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";

const CONCEPT_ICONS: readonly LucideIcon[] = [BookOpen, Repeat, Sparkles, UserRound];

// Ecosystem, Not a Course List™ — reframes the four programs above as
// four different modes of the same underlying practice (learn, practice,
// experience, personalise) rather than repeating the program names again,
// so this section reads as a philosophy statement, not a second catalog.
export default function HomeWhyMindUrMind(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.homeWhy;

  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mx-auto mb-4 max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          </div>
          <h2 className="mt-4 text-[26px] font-extrabold leading-tight sm:text-[32px]">{section.title}</h2>
          <p className="mt-2 text-[16px] font-semibold text-ink-dim">{section.subtitle}</p>
        </div>
        <p className="mx-auto mb-12 max-w-lg text-center text-[14.5px] leading-relaxed text-ink-dim">{section.lead}</p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.concepts.map((concept, index) => {
            const Icon = CONCEPT_ICONS[index] ?? BookOpen;
            return (
              <div key={concept.title} className="rounded-sm border border-line-strong bg-panel2 p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                  <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold uppercase tracking-[0.04em] text-ink">{concept.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{concept.desc}</p>
                <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.05em] text-ink-faint">{concept.programLabel}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
