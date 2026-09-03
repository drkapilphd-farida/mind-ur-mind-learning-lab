"use client";

import { useLanguage } from "@/context/LanguageContext";

// Choice Architecture™ — a single-click router for undecided visitors,
// not a multi-step quiz. Each option is a plain anchor into the section
// below (ProgramCardsGrid) that matches that pain point — #tier-1 (QSR,
// the featured card), #tier-2 (Retreat card), #tier-3 (Mentoring card),
// and #course-card (added to the Course card specifically for this).
// Doesn't hide or reorder the full grid — it sits directly above it so
// undecided visitors get a shortcut while everyone else just scrolls
// past to browse all five cards themselves.
export default function ProgramSelector(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.programSelector;

  return (
    <section className="border-b border-line bg-panel px-6 py-14 sm:px-8">
      <div className="mx-auto max-w-content">
        <p className="text-center text-[15px] font-semibold text-ink sm:text-[16px]">{section.prompt}</p>
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {section.options.map((option) => (
            <a
              key={option.text}
              href={option.anchor}
              className="group flex items-center justify-between gap-3 rounded-sm border border-line-strong bg-panel2 px-5 py-4 text-left text-[13.5px] text-ink transition-colors hover:border-gold/50 hover:bg-gold-soft/40"
            >
              {option.text}
              <span className="flex-none text-ink-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold">
                →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
