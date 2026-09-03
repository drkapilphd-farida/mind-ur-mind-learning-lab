"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { HABIT_BUILDER_SIGNUP_HREF } from "@/config/habitBuilderSignupLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Mirrors QsrHero.tsx's visual language (Eyebrow, gold accent headline,
// founder photo card) but the ask is different: Days 1-7 are free, so
// the primary CTA is a signup link, not a payment link — and the pricing
// line is stated in plain text right under it rather than left implicit,
// per explicit instruction not to bury the ₹99/Day-8 structure.
export default function HabitBuilderHero(): React.JSX.Element {
  const { t } = useLanguage();
  const habitBuilder = t.habitBuilderLanding;

  return (
    <section className="relative overflow-hidden border-b border-line px-6 pb-16 pt-14 sm:px-8 sm:pt-20 lg:pb-24">
      <div
        className="pointer-events-none absolute -right-32 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(184,134,46,0.10),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-content grid-cols-1 gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="max-w-xl">
          <Eyebrow color="text-gold">{habitBuilder.hero.eyebrow}</Eyebrow>

          <h1 className="mt-5 text-[36px] font-extrabold leading-[1.1] tracking-tight sm:text-[46px] lg:text-[50px]">
            {habitBuilder.hero.headline}
            <span className="mt-2 block font-display text-[0.6em] font-normal italic text-gold">
              {habitBuilder.hero.headlineEm}
            </span>
          </h1>

          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-dim sm:text-[18px]">
            {habitBuilder.hero.sub}
          </p>

          <div className="mt-10">
            <Link
              href={HABIT_BUILDER_SIGNUP_HREF}
              onClick={() => trackGaEvent("signup_cta_click", { location: "habit_builder_hero" })}
              className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
            >
              {habitBuilder.hero.ctaPrimary}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <p className="mt-2 font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink-faint">
              {habitBuilder.hero.ctaPrimaryMeta}
            </p>
            <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-ink-dim">{habitBuilder.hero.pricingLine}</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-faint">
            {t.hero.credentials.map((credential, index) => (
              <span key={credential} className="inline-flex items-center gap-3">
                {index > 0 && <span className="h-1 w-1 rounded-full bg-ink-faint/60" aria-hidden="true" />}
                {credential}
              </span>
            ))}
          </div>
        </div>

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
