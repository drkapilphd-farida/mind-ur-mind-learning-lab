"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

// Real Mentoring Testimonials™ — the current live page reused the retreat
// pages' video cards here ("DISCOVER YOUR SELF / 7 Days", "Residential
// Retreat Review" — retreat content, not mentoring), which this rebuild
// fixes by not reusing any of it. There is exactly one real,
// correctly-scoped testimonial for this offer — Priya M.'s quote
// (programKey: 'mentoring' in the shared testimonials pool, also used on
// the homepage's Personal Class card) — and zero real mentoring-specific
// videos yet. Per "show fewer cards rather than reusing mismatched
// ones," this renders just that one real quote and an honest note,
// rather than a video grid with nothing real to put in it.
export default function MentoringTestimonials(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.mentoringLanding.testimonials;
  const featured = t.testimonials.items.find((item) => item.programKey === "mentoring");

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        {featured !== undefined && (
          <div className="mx-auto max-w-2xl rounded-sm border border-rose/40 bg-rose-soft/40 p-8">
            <p className="mb-5 text-[18px] italic leading-relaxed text-ink sm:text-[20px]">
              &ldquo;{featured.quote}&rdquo;
            </p>
            <div className="text-[14px] font-semibold text-ink">{featured.name}</div>
            <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-rose">
              {featured.context || featured.program}
            </div>
          </div>
        )}

        <p className="mx-auto mt-8 max-w-md text-center text-[12.5px] leading-relaxed text-ink-faint">
          {section.comingSoonNote}
        </p>
      </div>
    </section>
  );
}
