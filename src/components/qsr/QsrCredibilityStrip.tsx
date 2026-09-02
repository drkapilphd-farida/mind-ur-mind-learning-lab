"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export type CredibilityLogo = {
  name: string;
  // Path to a real logo asset (e.g. "/logos/school-name.png") once one
  // exists — see the placeholder-mode note below for what renders until
  // then.
  src: string;
};

type QsrCredibilityStripProps = {
  // Real, confirmed institution logos — only pass these once specific
  // organizations have agreed to be named publicly. Empty by default.
  logos?: CredibilityLogo[];
  // Real, confirmed city names workshops have run in. Empty by default —
  // see the placeholder-mode note below for what renders until a real
  // list is supplied.
  cities?: string[];
};

// Social Proof Strip™ — sits directly under QsrAuthority's "10,000+
// Students Guided" / "500+ Workshops Delivered" cards, giving those
// numbers a visual credibility row rather than just prose.
//
// Three modes, resolved in order, swapped via a simple prop change:
//   1. `logos` non-empty  → real institution logos (once confirmed).
//   2. `cities` non-empty → honest "delivered across N+ cities" line.
//   3. neither supplied   → an explicit placeholder statement, never a
//      fabricated number or a row of empty "[LOGO]" tiles standing in
//      for institutions we don't have permission to name.
export default function QsrCredibilityStrip({ logos = [], cities = [] }: QsrCredibilityStripProps): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.credibilityStrip;

  return (
    <section className="border-b border-line bg-panel px-6 py-14 sm:px-8">
      <div className="mx-auto max-w-content text-center">
        {logos.length > 0 ? (
          <>
            <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
              {section.label}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {logos.map((logo) => (
                <Image
                  key={logo.name}
                  src={logo.src}
                  alt={logo.name}
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain opacity-70 grayscale transition-opacity hover:opacity-100"
                />
              ))}
            </div>
          </>
        ) : cities.length > 0 ? (
          <>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-gold">
              {section.citiesHeadlinePrefix} {cities.length}+ {section.citiesHeadlineSuffix}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-ink-dim">
              {cities.map((city, index) => (
                <span key={city} className="inline-flex items-center gap-3">
                  {index > 0 && <span className="h-1 w-1 rounded-full bg-ink-faint/60" aria-hidden="true" />}
                  {city}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
            {section.placeholderStatement}
          </p>
        )}
      </div>
    </section>
  );
}
