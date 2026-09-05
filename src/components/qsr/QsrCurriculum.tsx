"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

export default function QsrCurriculum(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.curriculum;

  // Visual Rhythm™ — lg:py-20 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section id="curriculum" className="border-b border-line bg-panel px-6 py-24 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        {/* Learning Journey — Step 1: Your Roadmap™ (Phase 5) — the primary,
            most prominent visual in this section: the real app screen
            showing the 4-phase daily roadmap (public/images/quantum-mind/
            14-your-daily-roadmap.png), answering "what do I do each day"
            before the week-by-week text below answers "what exactly am I
            learning." `object-contain` inside a container matching the
            source's exact 2442x1317 aspect ratio guarantees no cropping. */}
        <div className="relative mb-10 aspect-[2442/1317] w-full overflow-hidden rounded-sm border border-line-strong lg:mb-12">
          <Image
            src="/images/quantum-mind/14-your-daily-roadmap.png"
            alt="Your Daily Roadmap: the 30-day curriculum split into 4 phases, each tracked with real completion progress"
            fill
            sizes="(min-width: 1024px) 1180px, 100vw"
            className="object-contain"
          />
        </div>

        <div className="mx-auto max-w-3xl">
          {section.weeks.map((week, index) => (
            <div key={week.range} className="relative flex gap-6 pb-12 last:pb-0">
              <div className="flex flex-none flex-col items-center">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-gold/50 bg-panel2 font-mono text-[13px] font-semibold text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {index < section.weeks.length - 1 && (
                  <span className="mt-2 w-px flex-1 bg-line-strong" aria-hidden="true" />
                )}
              </div>
              <div className="pb-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-ink-faint">
                  {week.range}
                </span>
                <h3 className="mt-1.5 text-[19px] font-bold leading-snug sm:text-[21px]">{week.title}</h3>
                <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-ink-dim">{week.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Learning Journey — Step 2 + Step 3 (Phase 5) — a smaller,
            clearly-secondary pair of supporting visuals, deliberately NOT
            full section width like the Step 1 roadmap image above (that
            hierarchy — one prominent primary visual, everything else
            subordinate — is the whole point). Left: the same real app
            screen's day-by-day tracking grid (public/images/quantum-mind/
            15-mastery-curriculum.png, the continuation of the roadmap
            screen above, scrolled further down — "what exactly am I
            learning, day by day"). Right: the existing 30-Day Mastery
            screenshot (public/images/quantum-mind/17-30-day-quantum-speed-
            reading-mastery.png), already used as a small teaser card in
            QsrHero.tsx — reused here at a fuller size as "the culmination
            of the journey," not duplicated back-to-back with that earlier
            appearance since the two are separated by most of the page. */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-12">
          <div className="relative aspect-[2442/1317] w-full overflow-hidden rounded-sm border border-line-strong">
            <Image
              src="/images/quantum-mind/15-mastery-curriculum.png"
              alt="Every day of the 30-day curriculum tracked individually, unlocking sequentially as each is completed"
              fill
              sizes="(min-width: 1024px) 560px, (min-width: 640px) 45vw, 100vw"
              className="object-contain"
            />
          </div>
          <div className="relative aspect-[2442/1317] w-full overflow-hidden rounded-sm border border-line-strong">
            <Image
              src="/images/quantum-mind/17-30-day-quantum-speed-reading-mastery.png"
              alt="The finished 30-Day Quantum Speed Reading Mastery journey, with final Mind Score and progress across reading, memory, and focus"
              fill
              sizes="(min-width: 1024px) 560px, (min-width: 640px) 45vw, 100vw"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
