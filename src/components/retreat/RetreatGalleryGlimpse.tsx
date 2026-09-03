"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import PhotoGallery from "../PhotoGallery";
import { ONLINE_RETREAT_GALLERY_PHOTOS } from "@/config/onlineRetreatGalleryPhotos";

// Scoped to this retreat specifically (ONLINE_RETREAT_GALLERY_PHOTOS),
// not the homepage's general gallery subset or Residential's own venue
// photos — same per-page photo scoping the video reviews already went
// through.
export default function RetreatGalleryGlimpse(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.retreatLanding.gallery;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
            <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
          </div>
          <Link
            href="/gallery"
            className="group inline-flex flex-none items-center gap-2 font-mono text-[12.5px] uppercase tracking-[0.08em] text-ink-dim transition-colors hover:text-ink"
          >
            {section.viewGalleryCta}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <PhotoGallery photos={ONLINE_RETREAT_GALLERY_PHOTOS} />
      </div>
    </section>
  );
}
