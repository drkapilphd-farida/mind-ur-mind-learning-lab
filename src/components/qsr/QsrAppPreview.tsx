"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

// Real Product Screenshot™ — replaces the previous CSS-only "Illustrative
// Mockup" placeholder with the real Reading Intelligence Dashboard
// (public/images/quantum-mind/01-reading-intelligence-dashboard.png), now
// that one exists. `section.caption` below still reads correctly with a
// real screenshot ("your real numbers start from your own Day 1
// baseline") — it was never claiming the mockup itself was fake, only
// that the specific numbers shown are an example, which stays true here.
export default function QsrAppPreview(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.appPreview;

  return (
    <section id="app-preview" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="mx-auto w-full">
          <div className="relative aspect-[2442/1317] w-full overflow-hidden rounded-lg border border-line-strong shadow-[0_20px_50px_rgba(34,31,29,0.12)]">
            <Image
              src="/images/quantum-mind/01-reading-intelligence-dashboard.png"
              alt={section.title}
              fill
              sizes="(min-width: 1024px) 640px, 90vw"
              className="object-cover"
            />
          </div>
          <p className="px-3 py-3 text-center text-[11px] leading-relaxed text-ink-faint">{section.caption}</p>
        </div>
      </div>
    </section>
  );
}
