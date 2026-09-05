"use client";

import { Baby, BookOpenCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const PATHWAY_ICONS = [Baby, BookOpenCheck] as const;

// One Masterclass, Two Real Pathways™ — replaces the earlier myth/reality
// framing. Blindfold reading for children is presented honestly here as
// what it is: a trained skill visible in the student video reviews, not
// an independently verified/tested ability — the copy deliberately
// avoids "verified" (see the ADR/session note on this) — paired with
// the adult open-eye pathway, tied together by the shared underlying
// training (peripheral vision, concentration, right-brain engagement)
// already covered in QsrBrainScience above.
export default function QsrAgeGroups(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.ageGroups;

  // Visual Rhythm™ — lg:py-16 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section id="every-age" className="border-b border-line px-6 py-24 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {section.pathways.map((pathway, index) => {
            const Icon = PATHWAY_ICONS[index % PATHWAY_ICONS.length] ?? Baby;
            return (
              <div key={pathway.title} className="rounded-sm border border-line bg-panel2 p-7 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                    <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold">
                    {pathway.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-[19px] font-bold leading-snug text-ink">{pathway.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-dim">{pathway.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-sm border border-line-strong bg-panel px-7 py-6 text-center">
          <p className="text-[14.5px] leading-relaxed text-ink-dim">{section.unifyingLine}</p>
          <a
            href="#testimonials"
            className="mt-4 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-gold transition-colors hover:text-[#8f6820]"
          >
            {section.ctaLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
