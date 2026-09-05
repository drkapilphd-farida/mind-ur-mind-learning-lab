"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function QsrMechanics(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.mechanics;

  const cards = [
    { data: section.app, accent: "gold" as const },
    { data: section.live, accent: "teal" as const },
  ];

  // Visual Rhythm™ — lg:py-20 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section id="how-it-works" className="border-b border-line px-6 py-24 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
          {cards.map(({ data, accent }) => (
            <div
              key={data.title}
              className={`flex flex-col rounded-sm border p-8 sm:p-9 ${
                accent === "gold" ? "border-gold/30 bg-panel2" : "border-line bg-panel"
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
              <p className="mb-6 text-[14.5px] leading-relaxed text-ink-dim">{data.desc}</p>
              <ul className="mt-auto space-y-3">
                {data.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-[14px] text-ink">
                    <span
                      className={`mt-[7px] h-1.5 w-1.5 flex-none rounded-full ${
                        accent === "gold" ? "bg-gold" : "bg-teal"
                      }`}
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
