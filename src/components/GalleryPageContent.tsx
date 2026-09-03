"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import SimplePageNav from "./SimplePageNav";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import PhotoGallery from "./PhotoGallery";
import { GALLERY_PHOTOS, type GalleryCategory } from "@/config/galleryPhotos";

type FilterValue = GalleryCategory | "all";

export default function GalleryPageContent(): React.JSX.Element {
  const { t } = useLanguage();
  const g = t.galleryPage;
  const [filter, setFilter] = useState<FilterValue>("all");

  const filters: { value: FilterValue; label: string }[] = [
    { value: "all", label: g.filterAll },
    { value: "workshops", label: g.filterWorkshops },
    { value: "retreats", label: g.filterRetreats },
    { value: "qsr", label: g.filterQsr },
  ];

  const visiblePhotos = filter === "all" ? GALLERY_PHOTOS : GALLERY_PHOTOS.filter((photo) => photo.category === filter);

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <SimplePageNav />
      <main className="px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-content">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-gold">{g.eyebrow}</p>
            <h1 className="mt-4 text-[32px] font-extrabold leading-tight sm:text-[40px]">{g.title}</h1>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-dim">{g.desc}</p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {filters.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                  filter === option.value
                    ? "border-gold bg-gold-soft text-ink"
                    : "border-line-strong text-ink-dim hover:border-gold/50 hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <PhotoGallery photos={visiblePhotos} className="mt-10" />
        </div>
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
