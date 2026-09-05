"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { WHATSAPP_MASTERCLASS_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";
import type { Lang } from "@/lib/i18n";

// Real founder intro video, one per site language — swaps automatically
// with the existing language toggle (useLanguage()), no separate language
// system. youtube-nocookie.com is already CSP-whitelisted (next.config.ts
// frame-src), so no extra config is needed.
const INTRO_VIDEO_ID: Record<Lang, string> = {
  en: "Zsz0eUQ3t0o",
  hi: "64UmqM5_mEM",
};

export default function QsrFounderVideo(): React.JSX.Element {
  const { t, lang } = useLanguage();
  const section = t.qsrLanding.founderVideo;
  const youtubeVideoId = INTRO_VIDEO_ID[lang];

  // Visual Rhythm™ — lg:py-20 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section id="founder" className="border-b border-line bg-panel px-6 py-24 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-dim">{section.desc}</p>
          <a
            href={WHATSAPP_MASTERCLASS_INQUIRY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("whatsapp_click", { location: "qsr_founder_video" })}
            className="mt-6 inline-flex items-center gap-2 rounded-sm border border-teal/60 px-5 py-2.5 text-[13px] font-semibold text-teal transition-colors hover:bg-teal-soft"
          >
            {section.ctaLabel}
          </a>

          {/* Live Session Proof Visual™ — additive only, same reasoning as
              QsrHero.tsx: the founder photo/video slot to the right stays
              exactly as-is (it's reserved for Dr. Kapil's own face, real
              or eventually on video) — this is a supporting glimpse of
              what a live masterclass session actually looks like.
              `object-contain` inside an exact-aspect-ratio container
              guarantees the full app UI is never cropped. */}
          <div className="mt-8 w-full max-w-md overflow-hidden rounded-sm border border-line-strong bg-panel2 shadow-[0_12px_30px_rgba(34,31,29,0.1)] lg:max-w-xl">
            <div className="relative aspect-[2442/1317] w-full">
              <Image
                src="/images/quantum-mind/18-live-masterclasses-mentorship.png"
                alt="Inside a live Quantum Speed Reading masterclass session"
                fill
                sizes="(min-width: 1024px) 576px, (min-width: 448px) 448px, 90vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Real per-language intro video — key={lang} forces a full
            iframe remount on language switch, so the previous language's
            video is torn down rather than left stale underneath a new
            `src`. Only one iframe is ever mounted at a time. */}
        <div className="mx-auto w-full max-w-[560px] aspect-video overflow-hidden rounded-sm border border-line-strong shadow-[0_12px_30px_rgba(34,31,29,0.1)]">
          <iframe
            key={lang}
            src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
            title={section.videoTitle}
            loading="lazy"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
