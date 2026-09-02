"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function CourseProcess(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.courseLanding.process;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.steps.map((step, index) => (
            <div key={step.title} className="rounded-sm border border-line-strong bg-panel2 p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-rose/50 bg-rose-soft font-mono text-[13px] font-semibold text-rose">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
