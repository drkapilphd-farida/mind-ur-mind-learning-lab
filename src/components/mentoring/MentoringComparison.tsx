"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function MentoringComparison(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.mentoringLanding.comparison;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">
            {section.title} <span className="font-display italic text-rose">{section.titleEm}</span>
          </h2>
        </div>

        <div className="overflow-x-auto rounded-sm border border-line-strong">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line-strong bg-panel2">
                <th className="px-5 py-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-faint" />
                <th className="px-5 py-4 text-[13px] font-semibold text-ink-dim">{section.columnGroup}</th>
                <th className="px-5 py-4 text-[13px] font-semibold text-rose">{section.columnPersonal}</th>
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr key={row.label} className="border-b border-line last:border-b-0 odd:bg-panel even:bg-panel2/60">
                  <td className="px-5 py-4 text-[13.5px] font-semibold text-ink">{row.label}</td>
                  <td className="px-5 py-4 text-[13.5px] text-ink-dim">{row.group}</td>
                  <td className="px-5 py-4 text-[13.5px] font-medium text-ink">{row.personal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
