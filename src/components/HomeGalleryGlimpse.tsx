"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "./ui";
import PhotoGallery from "./PhotoGallery";
import { GALLERY_PHOTOS } from "@/config/galleryPhotos";
import { WORKSHOP_CITIES } from "@/config/workshopCities";

const GLIMPSE_PHOTO_COUNT = 8;

// Moments From Our Workshops™ — a subset of the same GALLERY_PHOTOS
// array /gallery uses (first 8, not a separately-authored list), so this
// section and the full gallery can never drift out of sync. City count
// is read live from WORKSHOP_CITIES.length (the same real, confirmed
// list the QSR page's credibility strip already uses) rather than a
// second hardcoded number — see that file for the actual confirmed
// count.
export default function HomeGalleryGlimpse(): React.JSX.Element {
  const { t } = useLanguage();
  const g = t.galleryGlimpse;
  const glimpsePhotos = GALLERY_PHOTOS.slice(0, GLIMPSE_PHOTO_COUNT);

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <Eyebrow color="text-gold">{g.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{g.title}</h2>
            <p className="mt-3 text-[15.5px] text-ink-dim">
              {g.subPrefix} {WORKSHOP_CITIES.length}+ {g.subSuffix}
            </p>
          </div>
          <Link
            href="/gallery"
            className="group inline-flex flex-none items-center gap-2 font-mono text-[12.5px] uppercase tracking-[0.08em] text-ink-dim transition-colors hover:text-ink"
          >
            {g.viewGalleryCta}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <PhotoGallery photos={glimpsePhotos} />
      </div>
    </section>
  );
}
