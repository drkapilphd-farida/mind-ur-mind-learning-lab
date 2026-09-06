"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";
import type { Lang } from "@/lib/i18n";

// Real founder intro video, one per site language — the same two verified
// videos already wired up on the QSR and Franchise pages, reused here via
// the same useLanguage()-driven lang map rather than a second, independent
// language system. No dedicated 45-60s full-ecosystem overview video
// exists in this repo yet (nothing under public/ or in config matches),
// so this section reuses the one real video that does exist rather than
// fabricating a new one — swap in a dedicated overview video here once
// one is produced.
const INTRO_VIDEO_ID: Record<Lang, string> = {
  en: "Zsz0eUQ3t0o",
  hi: "64UmqM5_mEM",
};

export default function HomeOverviewVideo(): React.JSX.Element {
  const { t, lang } = useLanguage();
  const section = t.homeOverviewVideo;
  const videoId = INTRO_VIDEO_ID[lang];

  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
        </div>
        <h2 className="mt-4 text-[26px] font-extrabold leading-tight sm:text-[32px]">{section.title}</h2>
        <p className="mt-3 text-[15px] text-ink-dim">{section.subtitle}</p>

        <div className="mx-auto mt-9 aspect-video w-full overflow-hidden rounded-sm border border-line-strong shadow-[0_16px_40px_rgba(34,31,29,0.12)]">
          <iframe
            key={lang}
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={section.videoTitle}
            loading="lazy"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
