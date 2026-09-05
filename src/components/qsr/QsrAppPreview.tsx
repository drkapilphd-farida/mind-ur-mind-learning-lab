"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

// Real Product Screenshot™ — the primary visual of this section
// (public/images/quantum-mind/01-reading-intelligence-dashboard.png).
// `object-contain` (not `object-cover`) inside a container whose
// `aspect-[2442/1317]` exactly matches the source PNG's real dimensions
// guarantees the full app UI is always visible, never cropped, even if
// either value is ever touched independently in the future. Grid tilted
// 0.8/1.2 (was 0.9/1.1) to give the screenshot more room to read as the
// section's primary visual — same two-column architecture, just a wider
// share for the image column, not a restructure.
export default function QsrAppPreview(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.appPreview;

  return (
    <section id="app-preview" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="mx-auto w-full">
          <div className="relative aspect-[2442/1317] w-full overflow-hidden rounded-lg border border-line-strong bg-panel2 shadow-[0_20px_50px_rgba(34,31,29,0.12)]">
            <Image
              src="/images/quantum-mind/01-reading-intelligence-dashboard.png"
              alt={section.title}
              fill
              sizes="(min-width: 1024px) 720px, 90vw"
              className="object-contain"
            />
          </div>
          <p className="px-3 py-3 text-center text-[11px] leading-relaxed text-ink-faint">{section.caption}</p>
        </div>
      </div>
    </section>
  );
}
