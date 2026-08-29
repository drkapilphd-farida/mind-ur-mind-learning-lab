"use client";

import { Play } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { WHATSAPP_MASTERCLASS_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

type QsrFounderVideoProps = {
  // No real founder-intro video is wired up yet. Pass a real YouTube
  // video ID here (e.g. "dQw4w9WgXcQ") once one is filmed — the section
  // switches from the honest "coming soon" poster to a real
  // youtube-nocookie.com embed automatically. That domain is already
  // CSP-whitelisted (see next.config.ts's frame-src), so no extra config
  // is needed when a real ID is supplied.
  youtubeVideoId?: string;
};

export default function QsrFounderVideo({ youtubeVideoId }: QsrFounderVideoProps): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.founderVideo;

  return (
    <section id="founder" className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-dim">{section.desc}</p>
        </div>

        <div className="mx-auto w-full max-w-[560px]">
          {youtubeVideoId !== undefined ? (
            <div className="aspect-video overflow-hidden rounded-sm border border-line-strong">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
                title={section.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-sm border border-line-strong bg-panel2 bg-[radial-gradient(circle_at_50%_45%,rgba(184,134,46,0.12),transparent_65%)]">
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-panel shadow-[0_4px_16px_rgba(34,31,29,0.08)]">
                  <Play className="ml-1 h-6 w-6 text-gold" aria-hidden="true" />
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  {section.placeholderLabel}
                </p>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex justify-center pb-5">
                <a
                  href={WHATSAPP_MASTERCLASS_INQUIRY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackGaEvent("whatsapp_click", { location: "qsr_founder_video" })}
                  className="rounded-sm border border-teal/60 bg-panel/85 px-5 py-2 text-[12.5px] font-semibold text-teal backdrop-blur-sm transition-colors hover:bg-teal-soft"
                >
                  {section.ctaLabel}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
