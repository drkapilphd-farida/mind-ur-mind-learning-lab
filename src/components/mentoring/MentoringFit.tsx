"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function MentoringFit(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.mentoringLanding.fit;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {section.items.map((item) => (
            <div key={item} className="rounded-sm border border-line-strong bg-panel2 p-6">
              <p className="text-[15px] italic leading-relaxed text-ink">&ldquo;{item}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
