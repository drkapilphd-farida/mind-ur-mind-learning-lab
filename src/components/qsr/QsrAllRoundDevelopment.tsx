"use client";

import Image from "next/image";
import { BookOpen, Wind, Target, Users, Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const ITEM_ICONS = [BookOpen, Wind, Target, Users] as const;

export default function QsrAllRoundDevelopment(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.allRoundDevelopment;

  // Visual Rhythm™ — lg:py-16 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-content">
        {/* Transformation™ (Phase 7) — this section's title already frames
            the "not just X, but Y" shift; it was the only sibling section
            with no supporting `desc` line under its heading. Added one
            minimal sentence, strictly summarizing what the four cards
            below already say (nothing new claimed), using the same
            careful, non-guaranteed phrasing this section's own disclaimer
            already established. */}
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.items.map((item, index) => {
            const Icon = ITEM_ICONS[index % ITEM_ICONS.length] ?? BookOpen;
            return (
              <div key={item.title} className="rounded-sm border border-line-strong bg-panel2 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Transformation™ (Phase 7) — a real, populated Reading
            Intelligence stats screen (public/images/quantum-mind/
            03-reading-intelligence-profile.png), genuinely showing a mix
            of modest, honest numbers (65% accuracy, WPM 200, 4 sessions)
            rather than a suspiciously perfect or empty one — chosen after
            checking several candidate assets specifically to rule out
            ones that were all-zero placeholder states. This is the
            section's one supporting visual, capped at max-w-2xl (not
            full section width) so it stays secondary to the four cards
            above, not a competing "screenshot wall." `object-contain`
            inside a container matching the source's exact 2442x1317
            aspect ratio guarantees no cropping. Caption reuses
            QsrAppPreview.tsx's own established honesty phrasing verbatim
            in spirit — these are example numbers, not a promised result. */}
        <div className="mx-auto mt-8 max-w-2xl lg:mt-10">
          <div className="relative aspect-[2442/1317] w-full overflow-hidden rounded-sm border border-line-strong">
            <Image
              src="/images/quantum-mind/03-reading-intelligence-profile.png"
              alt="A real Reading Intelligence stats screen: average WPM, accuracy, comprehension, and reading score, tracked from a student's own practice history"
              fill
              sizes="(min-width: 672px) 672px, 100vw"
              className="object-contain"
            />
          </div>
          <p className="px-3 py-3 text-center text-[11px] leading-relaxed text-ink-faint">{section.progressCaption}</p>
        </div>

        <div className="mx-auto mt-4 flex max-w-2xl items-start gap-3 rounded-sm border border-line-strong bg-panel2 px-5 py-4">
          <Info className="mt-0.5 h-4 w-4 flex-none text-ink-faint" aria-hidden="true" />
          <p className="text-[13px] leading-relaxed text-ink-dim">{section.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
