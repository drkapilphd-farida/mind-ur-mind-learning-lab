"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import QsrTrustBadge from "./QsrTrustBadge";
import QsrGuaranteeBadge from "./QsrGuaranteeBadge";
import CheckoutTrustLine from "../CheckoutTrustLine";
import HeroTestimonialBadge from "../HeroTestimonialBadge";
import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from "@/config/masterclassPaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

export default function QsrHero(): React.JSX.Element {
  const { t } = useLanguage();
  const qsr = t.qsrLanding;
  // Dr. Preeti's real, correctly-scoped QSR testimonial (qsrPageOnly) —
  // appropriate here since this is the QSR page itself.
  const featuredTestimonial = t.testimonials.items.find((item) => item.id === "dr-preeti");

  return (
    <section className="relative overflow-hidden border-b border-line px-6 pb-16 pt-14 sm:px-8 sm:pt-20 lg:pb-24">
      <div
        className="pointer-events-none absolute -right-32 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(184,134,46,0.10),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-content grid-cols-1 gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="max-w-xl">
          <Eyebrow color="text-gold">{qsr.hero.eyebrow}</Eyebrow>

          <h1 className="mt-5 text-[36px] font-extrabold leading-[1.1] tracking-tight sm:text-[46px] lg:text-[54px]">
            {qsr.hero.headline}
            <span className="mt-2 block font-display text-[0.72em] font-normal italic text-gold">
              {qsr.hero.headlineEm}
            </span>
          </h1>

          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-dim sm:text-[18px]">
            {qsr.hero.sub}
          </p>

          <div className="mt-10 flex flex-wrap items-start gap-4">
            <div>
              <a
                href={RAZORPAY_MASTERCLASS_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGaEvent("razorpay_checkout_click", { location: "qsr_hero" })}
                className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
              >
                {qsr.hero.ctaPrimary}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
              <p className="mt-2 font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink-faint">
                {qsr.hero.ctaPrimaryMeta}
              </p>
              <CheckoutTrustLine className="mt-1.5 max-w-[220px]" />
              {/* Short guarantee line right at the CTA itself — one line,
                  small text, distinct from QsrGuaranteeBadge's full box
                  further below, which stays as the complete-detail
                  version. */}
              <p className="mt-1.5 max-w-[240px] text-[11px] leading-snug text-ink-faint">{qsr.guarantee.heroLine}</p>
            </div>
            <Link
              href="/programs/quantum-speed-reading/speed-test"
              className="group inline-flex items-center gap-2.5 rounded-sm border border-teal/60 px-7 py-[15px] text-[14.5px] font-semibold text-teal transition-colors hover:bg-teal-soft"
            >
              {qsr.hero.ctaSecondary}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {featuredTestimonial !== undefined && (
            <HeroTestimonialBadge
              className="mt-5"
              quote={featuredTestimonial.quote}
              name={featuredTestimonial.name}
              context={featuredTestimonial.context || featuredTestimonial.program}
            />
          )}

          <div className="mt-6">
            <QsrTrustBadge />
          </div>

          <QsrGuaranteeBadge className="mt-4 max-w-md" />

          <p className="mt-8 text-[13.5px] text-ink-dim">{qsr.hero.trustLine}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-faint">
            {t.hero.credentials.map((credential, index) => (
              <span key={credential} className="inline-flex items-center gap-3">
                {index > 0 && <span className="h-1 w-1 rounded-full bg-ink-faint/60" aria-hidden="true" />}
                {credential}
              </span>
            ))}
          </div>

          {/* App Proof Visual™ — additive only, per explicit product
              decision: the founder photo in the portrait card stays
              exactly as-is (Founder Trust™ below still matters most on
              this page) — this is a supporting glimpse of the real
              30-day app streak itself, for a visitor who wants concrete
              proof before scrolling further. `object-contain` inside an
              exact-aspect-ratio container guarantees the full app UI is
              never cropped. */}
          <div className="mt-8 w-full max-w-md overflow-hidden rounded-sm border border-line-strong bg-panel2 shadow-[0_12px_30px_rgba(34,31,29,0.1)]">
            <div className="relative aspect-[2442/1317] w-full">
              <Image
                src="/images/quantum-mind/17-30-day-quantum-speed-reading-mastery.png"
                alt="Inside the 30-Day Quantum Speed Reading app streak"
                fill
                sizes="(min-width: 448px) 448px, 90vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Founder Trust™ — same treatment as the homepage hero
            (HeroSection.tsx): a real photo, not an avatar or the 30-day
            streak visual this slot used to hold. A face on the exact
            page a visitor converts on matters more here than the streak
            metaphor did. */}
        <div className="relative mx-auto w-full max-w-[360px] lg:mx-0 lg:ml-auto">
          <div className="relative overflow-hidden rounded-sm border border-line-strong bg-panel2">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/founder-warm.jpg"
                alt={t.hero.portraitName}
                fill
                sizes="(min-width: 1024px) 360px, 80vw"
                className="object-cover object-top"
              />
            </div>
            <div className="border-t border-line-strong px-6 py-4 text-center">
              <div className="text-[15px] font-bold text-ink">{t.hero.portraitName}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                {t.hero.portraitTitle}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 h-full w-full -z-10 rounded-sm border border-gold/25" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
