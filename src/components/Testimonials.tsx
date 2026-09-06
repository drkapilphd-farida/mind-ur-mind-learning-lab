"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";
import { isRealUrl } from "@/lib/isRealUrl";

export default function Testimonials(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.testimonials;
  // Cross-Program Scoping™ — this section is a general, cross-program
  // overview, so highly QSR-specific quotes (medical journals, market
  // reports — real, but confusing next to retreat/mentoring/course
  // quotes here) are excluded via `qsrPageOnly`, matching the same
  // exclusion RetreatVideoTestimonials.tsx applies. Ananya R.'s quote
  // stays: general enough to represent QSR here without that mismatch.
  const items = section.items.filter((item) => !item.qsrPageOnly);

  return (
    <section id="proof" className="border-b border-line px-6 py-24 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-content">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <Eyebrow>{section.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">
              {section.title}
            </h2>
            <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
          </div>
          <a
            href="/stories"
            className="group inline-flex flex-none items-center gap-2 font-mono text-[12.5px] uppercase tracking-[0.08em] text-ink-dim transition-colors hover:text-ink"
          >
            {section.viewAll}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const hasVideo = isRealUrl(item.videoUrl);
            const thumbnail = (
              <div className="relative mb-5 flex aspect-video items-center justify-center rounded-sm bg-panel2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/60 text-gold">
                  ▶
                </span>
              </div>
            );
            return (
              <div
                key={item.id}
                className="flex flex-col rounded-sm border border-line bg-panel p-6"
              >
                {hasVideo ? (
                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                    {thumbnail}
                  </a>
                ) : (
                  thumbnail
                )}
                <p className="mb-5 flex-1 text-[14px] italic leading-relaxed text-ink">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div>
                  <div className="text-[13.5px] font-semibold text-ink">{item.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
                    {item.context || item.program}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
