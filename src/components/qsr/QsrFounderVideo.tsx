"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { WHATSAPP_MASTERCLASS_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

type QsrFounderVideoProps = {
  // ─────────────────────────────────────────────────────────────────
  // SWAP-IN POINT for the real founder-intro video: pass a real
  // YouTube video ID here (e.g. "dQw4w9WgXcQ") once one is filmed.
  // That's the ONLY change needed — the section switches from the
  // modest founder-photo placeholder below to a full real
  // youtube-nocookie.com embed automatically. That domain is already
  // CSP-whitelisted (see next.config.ts's frame-src), so no extra
  // config is needed when a real ID is supplied.
  // ─────────────────────────────────────────────────────────────────
  youtubeVideoId?: string;
};

export default function QsrFounderVideo({ youtubeVideoId }: QsrFounderVideoProps): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.founderVideo;

  return (
    <section id="founder" className="border-b border-line bg-panel px-6 py-24 sm:px-8">
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
          <div className="mt-8 w-full max-w-md overflow-hidden rounded-sm border border-line-strong bg-panel2 shadow-[0_12px_30px_rgba(34,31,29,0.1)]">
            <div className="relative aspect-[2442/1317] w-full">
              <Image
                src="/images/quantum-mind/18-live-masterclasses-mentorship.png"
                alt="Inside a live Quantum Speed Reading masterclass session"
                fill
                sizes="(min-width: 448px) 448px, 90vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {youtubeVideoId !== undefined ? (
          <div className="mx-auto w-full max-w-[560px] aspect-video overflow-hidden rounded-sm border border-line-strong">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
              title={section.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          // Modest founder-photo placeholder — deliberately smaller and
          // quieter than a hero-sized empty video box (the previous
          // aspect-video/max-w-[560px] "coming soon" poster), until the
          // real video above is ready to swap in.
          <div className="relative mx-auto w-full max-w-[280px]">
            <div className="relative overflow-hidden rounded-sm border border-line-strong bg-panel2">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src="/founder-warm.jpg"
                  alt={t.hero.portraitName}
                  fill
                  sizes="280px"
                  className="object-cover object-top"
                />
              </div>
              <div className="border-t border-line-strong px-4 py-3 text-center">
                <div className="text-[13px] font-bold text-ink">{t.hero.portraitName}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint">
                  {section.placeholderLabel}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
