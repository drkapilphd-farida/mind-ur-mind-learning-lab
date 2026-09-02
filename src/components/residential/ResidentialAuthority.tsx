"use client";

import { CalendarClock, MessageSquareHeart, Users, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { RESIDENTIAL_PHOTOS } from "@/config/residentialGalleryPhotos";
import PhotoPlaceholder from "./PhotoPlaceholder";

const CARD_ICONS = [CalendarClock, MessageSquareHeart, Users, ShieldCheck] as const;

// Same pattern as RetreatAuthority.tsx/QsrAuthority.tsx — "since 2014"
// and "150+ real student reviews" are real facts given directly by the
// business owner, same trust basis as every other credential claim on
// this site.
export default function ResidentialAuthority(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.residentialLanding.authority;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        {/* Real photo slot — wires in from RESIDENTIAL_PHOTOS.liveTeaching
            (residentialGalleryPhotos.ts) once one exists; renders a clean
            placeholder tile until then, never instructional text. */}
        <PhotoPlaceholder
          src={RESIDENTIAL_PHOTOS.liveTeaching}
          alt="Dr. Kapil Dev Sharma live-teaching a residential retreat cohort"
          label="Live Teaching Photo"
          className="mb-10 aspect-[21/9] w-full rounded-sm"
          sizes="(min-width: 1024px) 1100px, 100vw"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.cards.map((card, index) => {
            const Icon = CARD_ICONS[index % CARD_ICONS.length] ?? CalendarClock;
            const isTrackRecord = index === 0;
            return (
              <div
                key={card.title}
                className={`rounded-sm border p-6 ${
                  isTrackRecord ? "border-gold/50 bg-panel2" : "border-line bg-panel2"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                    isTrackRecord ? "border-gold bg-gold-soft" : "border-gold/40 bg-gold-soft"
                  }`}
                >
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{card.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
