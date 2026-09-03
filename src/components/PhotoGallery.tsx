"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";

export type GalleryPhoto = {
  id: string;
  // Real, locally-stored photo path once one exists — undefined renders
  // a clearly labeled placeholder tile instead of a broken image, same
  // "never a silent fallback" discipline as PhotoPlaceholder.tsx.
  src: string | undefined;
  alt: string;
  category?: string;
};

type PhotoGalleryProps = {
  photos: readonly GalleryPhoto[];
  className?: string;
};

// Real Photo Gallery™ — same gallery+lightbox shape as VideoReviewGrid.tsx
// (card grid, click to open, Escape/backdrop to close, body scroll
// locked while open), extended with Left/Right arrow-key and
// prev/next-button navigation since a photo set is meant to be browsed
// through, not just opened one at a time like a single video. Plain
// custom modal, no dialog library, consistent with this codebase's
// existing hand-rolled lightbox pattern.
export default function PhotoGallery({ photos, className = "" }: PhotoGalleryProps): React.JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function showPrevious(): void {
    setOpenIndex((index) => (index === null ? null : (index - 1 + photos.length) % photos.length));
  }

  function showNext(): void {
    setOpenIndex((index) => (index === null ? null : (index + 1) % photos.length));
  }

  useEffect(() => {
    if (openIndex === null) return undefined;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, photos.length]);

  const openPhoto = openIndex !== null ? photos[openIndex] : undefined;

  return (
    <>
      <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`View photo: ${photo.alt}`}
            className="group relative aspect-square overflow-hidden rounded-sm border border-line-strong bg-panel2"
          >
            {photo.src !== undefined ? (
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_40%,rgba(184,134,46,0.10),transparent_65%)]"
                aria-hidden="true"
              >
                <ImageIcon className="h-6 w-6 text-ink-faint" aria-hidden="true" />
              </div>
            )}
          </button>
        ))}
      </div>

      {openPhoto !== undefined && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 px-4 backdrop-blur-sm"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-panel text-ink transition-colors hover:bg-panel2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-panel text-ink transition-colors hover:bg-panel2 sm:left-6"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          <div className="relative aspect-[4/3] w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
            {openPhoto.src !== undefined ? (
              <Image src={openPhoto.src} alt={openPhoto.alt} fill sizes="(min-width: 768px) 672px, 100vw" className="object-contain" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-sm border border-line-strong bg-panel2">
                <ImageIcon className="h-10 w-10 text-ink-faint" aria-hidden="true" />
                <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">{openPhoto.alt}</p>
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-panel text-ink transition-colors hover:bg-panel2 sm:right-6"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
