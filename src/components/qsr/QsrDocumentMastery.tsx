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
const SHOWCASE_IMAGES = [
  "09-document-mastery-studio.png",
  "10-document-mastery-overview.png",
  "11-document-knowledge-map.png",
  "12-document-key-concepts.png",
  "13-document-memory-notes.png",
] as const;

export default function QsrDocumentMastery(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.documentMastery;

  return (
    <section id="document-mastery" className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, index) => {
            const image = SHOWCASE_IMAGES[index];
            if (image === undefined) return null;
            return (
              <div key={item.title} className="overflow-hidden rounded-sm border border-line-strong bg-panel2">
                <div className="relative aspect-[2442/1317] w-full">
                  <Image
                    src={`/images/quantum-mind/${image}`}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-bold leading-snug text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-dim">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
