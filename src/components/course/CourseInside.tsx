"use client";

import { CalendarDays, NotebookPen, Video, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

// Icon per item, matched by array position (0: daily content, 1:
// workbook, 2: live sessions — the last item is always the strongest
// differentiator and gets its own highlighted card treatment below).
const ITEM_ICONS = [CalendarDays, NotebookPen, Video] as const;

export default function CourseInside(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.courseLanding.inside;
  const featuredIndex = section.items.length - 1;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {section.items.map((item, index) => {
            const Icon = ITEM_ICONS[index % ITEM_ICONS.length] ?? CalendarDays;
            const isFeatured = index === featuredIndex;
            return (
              <div
                key={item.title}
                className={`rounded-sm p-6 ${
                  isFeatured
                    ? "border-2 border-rose bg-rose-soft/50 sm:scale-[1.03]"
                    : "border border-line bg-panel"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                    isFeatured ? "border-rose bg-rose text-white" : "border-rose/40 bg-rose-soft text-rose"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2.5 rounded-sm border border-rose/40 bg-rose-soft/40 px-5 py-3">
          <Clock className="h-4 w-4 flex-none text-rose" aria-hidden="true" />
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.05em] text-rose">
            {section.accessNote}
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-2xl rounded-sm border border-line-strong bg-panel2 px-7 py-6">
          <p className="text-[13.5px] leading-relaxed text-ink-dim">{section.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
