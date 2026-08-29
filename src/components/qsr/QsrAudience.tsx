"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function QsrAudience(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.audience;
  const trustQuote = t.tier1.trustQuote;

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

        <p className="mx-auto mt-10 max-w-xl border-l-2 border-gold/40 pl-4 text-[14.5px] italic leading-relaxed text-ink-dim">
          &ldquo;{trustQuote.quote}&rdquo;
          <span className="not-italic text-ink-faint"> — {trustQuote.name}</span>
        </p>
      </div>
    </section>
  );
}
