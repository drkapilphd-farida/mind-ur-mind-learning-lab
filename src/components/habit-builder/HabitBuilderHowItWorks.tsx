"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

// Week timeline reuses QsrCurriculum.tsx's exact vertical-stepper
// pattern. The "every day follows the same shape" row underneath is new
// — a compact, honest summary of the real 4-step session structure
// (QuantumJourneySession.tsx), without naming individual exercises
// (there are 9 rotating ones, too much detail for a landing page).
export default function HabitBuilderHowItWorks(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.habitBuilderLanding.howItWorks;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="mx-auto max-w-3xl">
          {section.weeks.map((week, index) => (
            <div key={week.range} className="relative flex gap-6 pb-12 last:pb-0">
              <div className="flex flex-none flex-col items-center">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-gold/50 bg-panel2 font-mono text-[13px] font-semibold text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index < section.weeks.length - 1 && (
                  <span className="mt-2 w-px flex-1 bg-line-strong" aria-hidden="true" />
                )}
              </div>
              <div className="pb-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-ink-faint">
                  {week.range}
                </span>
                <h3 className="mt-1.5 text-[19px] font-bold leading-snug sm:text-[21px]">{week.title}</h3>
                <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-ink-dim">{week.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-3xl rounded-sm border border-line-strong bg-panel2 p-6 sm:p-7">
          <h3 className="text-[14.5px] font-bold text-ink">{section.dayShapeTitle}</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {section.dayShapeSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-2.5 sm:flex-col sm:items-start sm:gap-2">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-teal/40 bg-teal-soft font-mono text-[11px] font-semibold text-teal">
                  {index + 1}
                </span>
                <p className="text-[13px] leading-relaxed text-ink-dim">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
