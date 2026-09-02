"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function MentoringAreas(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.mentoringLanding.areas;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, index) => (
            <div key={item.title} className="rounded-sm border border-line bg-panel p-6">
              <div className="font-mono text-[12px] text-rose">{String(index + 1).padStart(2, "0")}</div>
              <h3 className="mt-3 text-[16px] font-bold leading-snug text-ink">{item.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-sm border border-line-strong bg-panel2 px-7 py-6">
          <p className="text-[13.5px] leading-relaxed text-ink-dim">{section.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
