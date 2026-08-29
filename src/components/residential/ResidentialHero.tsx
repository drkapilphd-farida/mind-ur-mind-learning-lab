"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { WHATSAPP_RESIDENTIAL_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";
import { RESIDENTIAL_PHOTOS } from "@/config/residentialGalleryPhotos";
import PhotoPlaceholder from "./PhotoPlaceholder";

export default function ResidentialHero(): React.JSX.Element {
  const { t } = useLanguage();
  const residential = t.residentialLanding;

  return (
    <section className="relative overflow-hidden border-b border-line px-6 pb-16 pt-14 sm:px-8 sm:pt-20 lg:pb-24">
      {/* Hero Background™ — full-bleed photo slot behind the hero
          content. Renders a subtle, unobtrusive wash today (no real
          photo yet); once RESIDENTIAL_PHOTOS.heroBackground is set, this
          becomes a real photo with a readability wash on top so the
          headline stays legible over arbitrary photography. */}
      <PhotoPlaceholder
        src={RESIDENTIAL_PHOTOS.heroBackground}
        alt="Residential retreat setting"
        label="Hero Background — Drop In Photo Here"
        variant="subtle"
        priority
        className="absolute inset-0 z-0"
      />
      {RESIDENTIAL_PHOTOS.heroBackground !== undefined && (
        <div className="absolute inset-0 z-0 bg-void/80" aria-hidden="true" />
      )}

      <div
        className="pointer-events-none absolute -left-32 top-0 z-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(184,134,46,0.10),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-content">
        <div className="mx-auto max-w-2xl text-center">
          {/* Founder Trust™ — same real photo as the homepage, QSR, and
              Online Retreat heroes. */}
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
            <Eyebrow color="text-gold">{residential.hero.eyebrow}</Eyebrow>
          </div>

          <h1 className="mt-5 text-[36px] font-extrabold leading-[1.1] tracking-tight sm:text-[46px] lg:text-[54px]">
            {residential.hero.headline}
            <span className="mt-2 block font-display text-[0.6em] font-normal italic text-gold">
              {residential.hero.headlineEm}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-ink-dim sm:text-[18px]">
            {residential.hero.sub}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <div>
              <a
                href={WHATSAPP_RESIDENTIAL_INQUIRY_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGaEvent("whatsapp_click", { location: "residential_hero" })}
                className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
              >
                {residential.hero.ctaPrimary}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
              <p className="mt-2 text-center font-mono text-[11.5px] uppercase tracking-[0.06em] text-ink-faint">
                {residential.hero.ctaPrimaryMeta}
              </p>
            </div>
            <a
              href="#roadmap"
              className="group inline-flex items-center gap-2.5 rounded-sm border border-teal/60 px-7 py-[15px] text-[14.5px] font-semibold text-teal transition-colors hover:bg-teal-soft"
            >
              {residential.hero.ctaSecondary}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <p className="mt-8 text-[13.5px] text-ink-dim">{residential.hero.trustLine}</p>
        </div>
      </div>
    </section>
  );
}
