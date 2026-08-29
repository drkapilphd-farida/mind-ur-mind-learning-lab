"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

// Illustrative Mockup™ — built from plain CSS shapes, not a real
// screenshot, so nothing here can drift out of sync with the actual app
// UI or misrepresent it. The caption under the stat tiles says so
// explicitly rather than leaving it ambiguous.
export default function QsrAppPreview(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.appPreview;

  return (
    <section id="app-preview" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="mx-auto w-full max-w-[440px] rounded-lg border border-line-strong bg-panel2 p-1.5 shadow-[0_20px_50px_rgba(34,31,29,0.12)]">
          <div className="flex items-center gap-1.5 px-3 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </div>

          <div className="rounded-md border border-line bg-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-faint">
                  {section.drillLabel}
                </p>
                <p className="mt-1 text-[17px] font-bold text-ink">{section.drillValue}</p>
              </div>
              <div className="flex w-[126px] flex-wrap justify-end gap-1" aria-hidden="true">
                {Array.from({ length: 30 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-[9px] w-[9px] rounded-[2px] ${i < 12 ? "bg-teal" : "bg-line-strong"}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {section.stats.map((stat) => (
                <div key={stat.label} className="rounded-sm border border-line bg-panel2 px-3 py-3 text-center">
                  <p className="text-[16px] font-bold text-ink">{stat.value}</p>
                  <p className="mt-1 font-mono text-[9.5px] uppercase leading-tight tracking-[0.05em] text-ink-faint">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="px-3 py-3 text-center text-[11px] leading-relaxed text-ink-faint">{section.caption}</p>
        </div>
      </div>
    </section>
  );
}
