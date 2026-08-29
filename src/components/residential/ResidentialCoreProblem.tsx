"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

// Same Problem-Before-Solution™ pattern as RetreatCoreProblem.tsx, but
// the objection this pre-empts is one level deeper: "isn't this the same
// as your online retreat?" — the pain points name specifically why even
// a live online session can't replace physical distance and an in-person
// teacher for this depth of energy work.
export default function ResidentialCoreProblem(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.residentialLanding.coreProblem;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-10 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-dim">{section.desc}</p>
        </div>

        <div className="mx-auto max-w-2xl divide-y divide-line border-y border-line">
          {section.painPoints.map((point) => (
            <p key={point} className="py-4 text-[14.5px] leading-relaxed text-ink">
              {point}
            </p>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-sm border border-teal/30 bg-teal-soft px-7 py-6">
          <p className="text-[14.5px] leading-relaxed text-ink">{section.solution}</p>
        </div>
      </div>
    </section>
  );
}
