"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function QsrMoreThanSpeed(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.moreThanSpeed;

  const cards = [
    { data: section.goalSetting, accent: "gold" as const },
    { data: section.memoryTechniques, accent: "teal" as const },
  ];

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
          {cards.map(({ data, accent }) => (
            <div
              key={data.title}
              className={`flex flex-col rounded-sm border p-8 sm:p-9 ${
                accent === "gold" ? "border-gold/30 bg-panel2" : "border-line-strong bg-panel2"
              }`}
            >
              <span
                className={`w-fit font-mono text-[11px] uppercase tracking-[0.09em] ${
                  accent === "gold" ? "text-gold" : "text-teal"
                }`}
              >
                {data.tag}
              </span>
              <h3 className="mb-3 mt-3 text-[21px] font-bold leading-snug">{data.title}</h3>
              <p className="text-[14.5px] leading-relaxed text-ink-dim">{data.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
