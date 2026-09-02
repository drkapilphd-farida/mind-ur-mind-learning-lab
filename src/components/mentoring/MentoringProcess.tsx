"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function MentoringProcess(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.mentoringLanding.process;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            {section.steps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-rose/50 bg-rose-soft font-mono text-[13px] font-semibold text-rose">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-dim">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {section.formats.map((format) => (
              <div key={format.duration} className="rounded-sm border border-line-strong bg-panel2 p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[19px] font-bold text-ink">{format.duration}</span>
                  <span className="rounded-full border border-rose/40 bg-rose-soft px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-rose">
                    {format.tag}
                  </span>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-dim">{format.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
