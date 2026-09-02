"use client";

import { MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { RESIDENTIAL_PHOTOS } from "@/config/residentialGalleryPhotos";
import PhotoPlaceholder from "./PhotoPlaceholder";

// Real, confirmed venues: Dream Holiday Resort (Tungarli, Lonavala) hosts
// three of the four dates; Hotel Krishna Cottage (Jonk, Swargashram,
// Rishikesh) hosts the February 2027 date. Both names/addresses given
// directly by the business owner. `venues.locations` is fixed order —
// index 0 is always Lonavala, index 1 always Rishikesh — so the photo
// slots below map by position, same pattern as the icon-by-index used
// elsewhere on this page.
const VENUE_PHOTOS = [RESIDENTIAL_PHOTOS.venues.lonavala, RESIDENTIAL_PHOTOS.venues.rishikesh];
const VENUE_PHOTO_LABELS = ["Lonavala", "Rishikesh"];

export default function ResidentialVenues(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.residentialLanding.venues;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {section.locations.map((location, index) => (
            <div key={location.name} className="overflow-hidden rounded-sm border border-line-strong bg-panel2">
              <PhotoPlaceholder
                src={VENUE_PHOTOS[index]}
                alt={`${location.name}, ${location.address}`}
                label={VENUE_PHOTO_LABELS[index] ?? "Venue Photo"}
                className="aspect-[4/3] w-full"
                sizes="(min-width: 640px) 50vw, 100vw"
              />
              <div className="p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                  <MapPin className="h-5 w-5 text-teal" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[17px] font-bold leading-snug text-ink">{location.name}</h3>
                <p className="mt-1.5 font-mono text-[12px] uppercase tracking-[0.05em] text-ink-faint">
                  {location.address}
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-dim">{location.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
