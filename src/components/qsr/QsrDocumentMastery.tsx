"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

// Document Mastery Studio Showcase™ — the app's separate Tier 1 "Upload &
// Learn" feature (AI Document Transformer) has never been shown anywhere
// on the public QSR landing page before this; five real screenshots
// (public/images/quantum-mind/09–13-*.png) now give it one compact
// section, positioned right after AllRoundDevelopment ("what else you
// get beyond raw speed practice") and before Curriculum, matching that
// same narrative beat.
//
// Primary + Supporting Hierarchy™ — Phase 2: `09` (Upload & Learn, the
// literal entry point of the feature) is the one large primary visual;
// `10`–`13` are a smaller supporting row beneath it (image + title only,
// no description — keeps the section from reading as five equal-weight
// cards, "visually heavy" per the same brief this responds to). Still
// one section, same five images, same copy content — only the visual
// weighting changed.
const PRIMARY_IMAGE = "09-document-mastery-studio.png";
const SUPPORTING_IMAGES = [
  "10-document-mastery-overview.png",
  "11-document-knowledge-map.png",
  "12-document-key-concepts.png",
  "13-document-memory-notes.png",
] as const;

export default function QsrDocumentMastery(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.documentMastery;
  const [primaryItem, ...supportingItems] = section.items;

  return (
    // Visual Rhythm™ — deliberately NOT `bg-panel`: this used to sit
    // between QsrAllRoundDevelopment and QsrCurriculum, both `bg-panel`,
    // making three identical-background sections in a row read as one
    // long undifferentiated white zone. Transparent here restores proper
    // alternation. `lg:py-20` (was flat `py-24` at every breakpoint,
    // mobile/tablet unchanged) trims a little of the desktop-only
    // vertical rhythm this section doesn't need as much of, given how
    // visually full its own content already is.
    <section id="document-mastery" className="border-b border-line px-6 py-24 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl lg:mb-10">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        {primaryItem !== undefined && (
          <div className="mb-6 overflow-hidden rounded-sm border border-line-strong bg-panel2">
            <div className="relative aspect-[2442/1317] w-full">
              <Image
                src={`/images/quantum-mind/${PRIMARY_IMAGE}`}
                alt={primaryItem.title}
                fill
                sizes="(min-width: 1024px) 760px, 90vw"
                className="object-contain"
              />
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="text-[17px] font-bold leading-snug text-ink">{primaryItem.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink-dim">{primaryItem.desc}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {supportingItems.map((item, index) => {
            const image = SUPPORTING_IMAGES[index];
            if (image === undefined) return null;
            return (
              <div key={item.title} className="overflow-hidden rounded-sm border border-line-strong bg-panel2">
                <div className="relative aspect-[2442/1317] w-full">
                  <Image
                    src={`/images/quantum-mind/${image}`}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 270px, 45vw"
                    className="object-contain"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-[12.5px] font-bold leading-snug text-ink">{item.title}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
