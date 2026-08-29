"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import { RESIDENTIAL_PHOTOS } from "@/config/residentialGalleryPhotos";
import PhotoPlaceholder from "./PhotoPlaceholder";

// Retreat environment / group photo gallery grid — 6 slots today, all
// placeholders until real photos are dropped into
// RESIDENTIAL_PHOTOS.gallery (residentialGalleryPhotos.ts).
export default function ResidentialGallery(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.residentialLanding.gallery;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {RESIDENTIAL_PHOTOS.gallery.map((src, index) => (
            <PhotoPlaceholder
              key={index}
              src={src}
              alt={`Residential retreat environment photo ${index + 1}`}
              label="Gallery Photo"
              className="aspect-square w-full rounded-sm"
              sizes="(min-width: 640px) 33vw, 50vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
