"use client";

import Image from "next/image";
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

        {/* Mechanism Visual Storytelling™ (Phase 4, path corrected 4A) —
            the section's own intro line above ("a daily app streak that
            trains the skill...") already sets up exactly what this image
            shows concretely: the real asset at
            public/images/quantum-mind/05-how-quantum-speed-reading-works.png,
            visually walking through word-by-word reading → phrase
            recognition → wider visual span → visualization → understanding.
            Placed before the two practice-structure cards below, so the
            page shows WHAT is being trained before HOW practice is
            structured around it. Kept full-width and prominent (unlike
            Image 04 in QsrBrainScience.tsx, this one has no redundant real
            HTML cards duplicating its content elsewhere on the page, so
            there's no "second copy" concern to correct here). No new
            heading added — the image already carries its own, and the two
            cards below keep their existing real copy untouched.
            `object-contain` inside a container matching the source's exact
            1774x887 (2:1) aspect ratio guarantees the full graphic is
            never cropped. */}
        <div className="relative mb-10 aspect-[2/1] w-full overflow-hidden rounded-sm border border-line-strong lg:mb-12">
          <Image
            src="/images/quantum-mind/05-how-quantum-speed-reading-works.png"
            alt="How Quantum Speed Reading works: word-by-word reading progresses to phrase recognition, a wider visual span, visualization and connection, then understanding and memory"
            fill
            sizes="(min-width: 1024px) 1180px, 100vw"
            className="object-contain"
          />
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
