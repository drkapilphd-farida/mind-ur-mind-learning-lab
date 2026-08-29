"use client";

import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

// Same checklist pattern as RetreatOutcomes.tsx, but for audience fit
// rather than outcomes — plus an honest disqualifier line so the section
// filters as much as it converts.
export default function ResidentialAudience(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.residentialLanding.audience;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-12 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4">
          {section.items.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-sm border border-line-strong bg-panel2 p-5">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-gold" aria-hidden="true" />
              <p className="text-[14.5px] leading-relaxed text-ink">{item}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[13.5px] italic leading-relaxed text-ink-dim">
          {section.disclaimer}
        </p>
      </div>
    </section>
  );
}
