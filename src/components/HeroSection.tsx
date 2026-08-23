"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow, CtaButton } from "./ui";
import FrequencyDial from "./FrequencyDial";

export default function HeroSection(): React.JSX.Element {
  const { t } = useLanguage();

  return (
    <section id="top" className="relative overflow-hidden border-b border-line px-6 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pb-28">
      {/* signature visual, positioned behind content */}
      <div
        className="pointer-events-none absolute -right-40 top-1/2 hidden w-[720px] -translate-y-1/2 opacity-90 md:block lg:-right-24 xl:right-0"
        aria-hidden="true"
      >
        <FrequencyDial />
      </div>

      <div className="relative z-10 mx-auto grid max-w-content grid-cols-1 gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* copy column */}
        <div className="max-w-xl">
          <Eyebrow>{t.hero.eyebrow}</Eyebrow>

          <h1 className="mt-6 text-[38px] font-extrabold leading-[1.08] tracking-tight sm:text-[50px] lg:text-[58px]">
            {t.hero.headline}
            <span className="mt-2 block font-display text-[0.72em] font-normal italic text-gold">
              {t.hero.headlineEm}
            </span>
          </h1>

          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-dim sm:text-[18px]">
            {t.hero.sub}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <CtaButton href="#tier-1" variant="primary" accent="gold">
              {t.hero.ctaPrimary}
            </CtaButton>
            <CtaButton href="#tier-4" variant="ghost" accent="teal">
              {t.hero.ctaSecondary}
            </CtaButton>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-3 lg:grid-cols-none lg:flex lg:flex-wrap">
            {t.hero.stats.map((stat) => (
              <div key={stat.label} className="lg:min-w-[130px]">
                <div className="text-[14px] font-bold text-ink">{stat.value}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* portrait card */}
        <div className="relative mx-auto w-full max-w-[340px] lg:mx-0 lg:ml-auto">
          <div className="relative overflow-hidden rounded-sm border border-line-strong bg-gradient-to-b from-panel2 to-panel p-1">
            <div className="flex aspect-[4/5] flex-col items-center justify-end rounded-sm bg-gradient-to-b from-transparent via-transparent to-void/80 bg-[radial-gradient(circle_at_50%_35%,rgba(212,175,55,0.16),transparent_65%)] px-6 pb-7 pt-10">
              {/* portrait placeholder — swap `src` for the real photograph */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gold/50 bg-panel2 font-display text-3xl italic text-gold">
                KS
              </div>
              <div className="mt-5 text-center">
                <div className="text-[15px] font-bold text-ink">{t.hero.portraitName}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                  {t.hero.portraitTitle}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 h-full w-full -z-10 rounded-sm border border-gold/25" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
