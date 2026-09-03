"use client";

import { useLanguage } from "@/context/LanguageContext";

// Deliberately small and low-visual-weight — a single-line banner, not a
// full section with its own eyebrow/hero treatment like the sections
// around it. The homepage's primary audience is students/parents; this
// is only a teaser pointing interested trainers/edupreneurs to
// /franchise-individual for the full pitch, not the pitch itself.
export default function HomeFranchiseTeaser(): React.JSX.Element {
  const { t } = useLanguage();
  const teaser = t.homeFranchiseTeaser;

  return (
    <section className="border-b border-line px-6 py-10 sm:px-8">
      <div className="mx-auto flex max-w-content flex-col items-center gap-5 rounded-sm border border-line-strong bg-panel px-6 py-7 text-center sm:flex-row sm:justify-between sm:gap-6 sm:text-left">
        <div>
          <h2 className="text-[16px] font-bold leading-snug text-ink sm:text-[17px]">{teaser.headline}</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">{teaser.line}</p>
        </div>
        <a
          href="/franchise-individual"
          className="inline-flex flex-none items-center gap-2 rounded-sm border border-teal/60 px-5 py-2.5 text-[13px] font-semibold text-teal transition-colors hover:bg-teal-soft"
        >
          {teaser.cta}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
