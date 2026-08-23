"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow, CtaButton } from "./ui";

export default function TierFlagship(): React.JSX.Element {
  const { t } = useLanguage();
  const streak = t.tier1;

  return (
    <section
      id="tier-1"
      className="border-b border-line bg-gradient-to-b from-panel to-void px-6 py-24 sm:px-8"
    >
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{streak.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[30px] font-extrabold leading-tight sm:text-[38px]">
            {streak.title}{" "}
            <span className="font-display italic text-gold">{streak.titleEm}</span>
          </h2>
        </div>

        <div className="relative grid grid-cols-1 items-center gap-12 rounded-sm border border-line-strong bg-panel2 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr]">
          <span className="absolute -top-px left-8 -translate-y-1/2 bg-gold px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.1em] text-[#1B1508] sm:left-12">
            {streak.eyebrow.toUpperCase()}
          </span>

          <div>
            <p className="text-[16px] leading-relaxed text-ink-dim">{streak.desc}</p>

            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {streak.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2.5 text-[14.5px] text-ink">
                  <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-9">
              <CtaButton href="/programs/quantum-speed-reading" variant="primary" accent="gold">
                {streak.cta}
              </CtaButton>
            </div>
          </div>

          {/* 30-day streak visual */}
          <div className="relative flex aspect-square items-center justify-center rounded-sm border border-line bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.14),transparent_70%)]">
            <div className="flex w-[210px] flex-wrap justify-center gap-1.5" aria-hidden="true">
              {Array.from({ length: 30 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-4 w-4 rounded-[3px] ${
                    i < 22 ? "bg-gold" : "bg-line-strong"
                  }`}
                />
              ))}
            </div>
            <div className="absolute bottom-6 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
              {streak.visualCaption}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
