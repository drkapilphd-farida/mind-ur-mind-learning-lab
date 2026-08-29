"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import CheckoutTrustLine from "../CheckoutTrustLine";
import { RAZORPAY_RETREAT_PAYMENT_LINK } from "@/config/retreatPaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

type RetreatHeroProps = {
  // No real retreat introduction video is wired up yet — same honest
  // placeholder pattern as QsrFounderVideo.tsx. Pass a real YouTube
  // video ID once one is filmed and the banner switches to a live embed
  // automatically (youtube-nocookie.com is already CSP-whitelisted, see
  // next.config.ts's frame-src).
  youtubeVideoId?: string;
};

export default function RetreatHero({ youtubeVideoId }: RetreatHeroProps): React.JSX.Element {
  const { t } = useLanguage();
  const retreat = t.retreatLanding;

  return (
    <section className="relative overflow-hidden border-b border-line px-6 pb-16 pt-14 sm:px-8 sm:pt-20 lg:pb-24">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(184,134,46,0.10),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-content">
        <div className="mx-auto max-w-2xl text-center">
          {/* Founder Trust™ — same real photo as the homepage and QSR
              heroes, sized as a circular badge here since this hero's
              layout is centered/single-column rather than a 2-up grid
              with a dedicated photo slot. */}
          <div className="mb-6 flex justify-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-gold/50">
              <Image
                src="/founder-warm.jpg"
                alt={t.hero.portraitName}
                fill
                sizes="80px"
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Eyebrow color="text-gold">{retreat.hero.eyebrow}</Eyebrow>
          </div>

          <h1 className="mt-5 text-[36px] font-extrabold leading-[1.1] tracking-tight sm:text-[46px] lg:text-[54px]">
            {retreat.hero.headline}
            <span className="mt-2 block font-display text-[0.66em] font-normal italic text-gold">
              {retreat.hero.headlineEm}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-ink-dim sm:text-[18px]">
            {retreat.hero.sub}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <div>
              <a
                href={RAZORPAY_RETREAT_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGaEvent("razorpay_checkout_click", { location: "retreat_hero" })}
                className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
              >
                {retreat.hero.ctaPrimary}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
              <p className="mt-2 text-center font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink-faint">
                {retreat.hero.ctaPrimaryMeta}
              </p>
              <CheckoutTrustLine className="mt-1.5 max-w-[220px] text-center" />
            </div>
            <a
              href="#disciplines"
              className="group inline-flex items-center gap-2.5 rounded-sm border border-teal/60 px-7 py-[15px] text-[14.5px] font-semibold text-teal transition-colors hover:bg-teal-soft"
            >
              {retreat.hero.ctaSecondary}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <p className="mt-8 text-[13.5px] text-ink-dim">{retreat.hero.trustLine}</p>

          {/* Low-Commitment Entry™ — QSR's hero has a "Preview 7-Day Free
              App" secondary path for hesitant visitors; the retreat has no
              equivalent free-trial asset, so this points to the real,
              already-embedded video testimonials section further down this
              same page (RetreatVideoTestimonials.tsx, #testimonials)
              instead of inventing an audio/video preview that doesn't
              exist. */}
          <a
            href="#testimonials"
            className="mt-4 inline-block text-[13px] text-ink-faint underline decoration-ink-faint/50 underline-offset-2 transition-colors hover:text-ink-dim"
          >
            {retreat.hero.ctaTertiary}
          </a>
        </div>

        {/* video/banner placeholder */}
        <div className="mx-auto mt-14 w-full max-w-4xl">
          {youtubeVideoId !== undefined ? (
            <div className="aspect-video overflow-hidden rounded-sm border border-line-strong">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
                title={retreat.hero.headline}
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
                  {retreat.hero.visualPlaceholderLabel}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
