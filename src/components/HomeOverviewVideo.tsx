"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";

// Real, approved workshop highlight video (youtu.be/yqBKHd-9apk) —
// replaces the earlier temporary stand-in (the QSR/Franchise founder
// intro video, reused here only because no dedicated overview video
// existed yet). Only one approved video was supplied, no separate Hindi
// cut, so it's used as-is for both languages.
const OVERVIEW_VIDEO_ID = "yqBKHd-9apk";

export default function HomeOverviewVideo(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.homeOverviewVideo;

  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
        </div>
        <h2 className="mt-4 text-[26px] font-extrabold leading-tight sm:text-[32px]">{section.title}</h2>
        <p className="mt-3 text-[15px] text-ink-dim">{section.subtitle}</p>

        {/* Clean container padding — a thin outer panel frame around the
            video, not just an edge-to-edge iframe, so it reads as an
            intentional showcase rather than a bare embed. */}
        <div className="mx-auto mt-9 rounded-sm border border-line-strong bg-panel2 p-2 shadow-[0_16px_40px_rgba(34,31,29,0.12)] sm:p-3">
          <div className="aspect-video w-full overflow-hidden rounded-sm">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${OVERVIEW_VIDEO_ID}`}
              title={section.videoTitle}
              loading="lazy"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <p className="mt-7 text-[15px] font-semibold text-ink">{section.closingMessage}</p>
        <a
          href="#begin"
          className="group mt-4 inline-flex items-center gap-2 text-[13.5px] font-semibold text-teal"
        >
          {section.cta}
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </a>
      </div>
    </section>
  );
}
