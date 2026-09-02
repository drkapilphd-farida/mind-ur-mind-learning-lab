"use client";

import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function QsrAudience(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.audience;
  // Ananya R.'s quote is the featured card in QsrVideoTestimonials below,
  // on the same page — picking a different real QSR quote here (by the
  // stable, untranslated `id`, not `name` — the Hindi name is a
  // different string entirely, and array position broke once real
  // testimonials replaced the placeholder pool) so the two sections
  // don't repeat each other. Karan Mehra's quote ties directly to this
  // section's students/professionals framing (study & prep time). Falls
  // back to the first QSR entry if that id is ever removed.
  const qsrTestimonials = t.testimonials.items.filter((item) => item.programKey === "qsr");
  const trustQuote = qsrTestimonials.find((item) => item.id === "karan-mehra") ?? qsrTestimonials[0];

  return (
    <section id="who-its-for" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {section.groups.map((group) => (
            <div key={group.title} className="rounded-sm border border-line bg-panel p-7">
              <h3 className="text-[18px] font-bold text-ink">{group.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-dim">{group.desc}</p>
            </div>
          ))}
        </div>

        {/* Parent-Focused Outcomes™ — merged into "Who This Is Built For"
            rather than a separate section, per the request's own
            placement suggestion. Concrete, day-to-day, observable
            outcomes only — never clinical or guaranteed-outcome
            language (that's what QsrGuaranteeBadge is specifically
            for, and it's WPM-specific, not a general promise). */}
        <div className="mx-auto mt-10 max-w-2xl rounded-sm border border-line-strong bg-panel2 px-7 py-6">
          <h3 className="text-[15px] font-bold text-ink">{section.parentSection.title}</h3>
          <div className="mt-4 space-y-2.5">
            {section.parentSection.items.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-teal" aria-hidden="true" />
                <p className="text-[13.5px] leading-relaxed text-ink-dim">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {trustQuote !== undefined && (
          <p className="mx-auto mt-10 max-w-xl border-l-2 border-gold/40 pl-4 text-[14.5px] italic leading-relaxed text-ink-dim">
            &ldquo;{trustQuote.quote}&rdquo;
            <span className="not-italic text-ink-faint"> — {trustQuote.name}</span>
          </p>
        )}
      </div>
    </section>
  );
}
