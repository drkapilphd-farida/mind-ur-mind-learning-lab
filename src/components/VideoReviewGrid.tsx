"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import type { RetreatVideoReview } from "@/config/retreatVideoReviews";

type VideoReviewGridProps = {
  videos: readonly RetreatVideoReview[];
  className?: string;
  // Grid tile + lightbox aspect ratio. Defaults to 16:9 (existing
  // behavior, unchanged for every current caller). Pass "aspect-[9/16]"
  // for real YouTube Shorts so the vertical frame isn't cropped into a
  // landscape box.
  aspectRatioClassName?: string;
  // Optional caption rendered under every card (e.g. "Student
  // Testimonial") for videos with no verified per-video name/city to
  // show — also strengthens the thumbnail alt text and button
  // aria-label. Omitted by default (existing behavior unchanged).
  cardLabel?: string;
};

function buildEmbedUrl(videoId: string): string {
  // youtube-nocookie.com, not youtube.com — the only YouTube embed domain
  // next.config.ts's CSP frame-src allows (see reviewsPlaylist.ts). No
  // autoplay param — playback only starts once a card is clicked open.
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}

// Real Video Review Gallery™ — our own browsing surface (card grid, real
// extracted thumbnails, centered play-button affordance) rather than an
// inline YouTube iframe or YouTube's own thumbnail images. Clicking a
// card opens a real, distinct video in a dismissible lightbox; the page
// itself never embeds YouTube's page chrome. Plain custom modal (no
// dialog library) — Escape key and backdrop click both close it, body
// scroll is locked while open, consistent with this page family's
// existing hand-rolled component style.
export default function VideoReviewGrid({
  videos,
  className = "",
  aspectRatioClassName = "aspect-video",
  cardLabel,
}: VideoReviewGridProps): React.JSX.Element {
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const isVertical = aspectRatioClassName !== "aspect-video";

  useEffect(() => {
    if (openVideoId === null) return undefined;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpenVideoId(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openVideoId]);

  return (
    <>
      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {videos.map((video) => (
          <div key={video.videoId}>
            <button
              type="button"
              onClick={() => setOpenVideoId(video.videoId)}
              aria-label={cardLabel !== undefined ? `Play ${cardLabel}` : "Play video review"}
              className={`group relative w-full ${aspectRatioClassName} overflow-hidden rounded-sm border border-line-strong bg-panel2`}
            >
              {video.thumbnailSrc !== undefined ? (
                <Image
                  src={video.thumbnailSrc}
                  alt={cardLabel ?? "Real student video review"}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(184,134,46,0.18),transparent_60%)] bg-panel2"
                  aria-hidden="true"
                />
              )}
              <div className="absolute inset-0 bg-void/20 transition-colors duration-200 group-hover:bg-void/35" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/60 bg-void/40 text-gold backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
                  <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
                </span>
              </span>
            </button>
            {cardLabel !== undefined && (
              <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">{cardLabel}</p>
            )}
          </div>
        ))}
      </div>

      {openVideoId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/85 px-4 backdrop-blur-sm"
          onClick={() => setOpenVideoId(null)}
        >
          <div className={`relative w-full ${isVertical ? "max-w-xs sm:max-w-sm" : "max-w-2xl"}`} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenVideoId(null)}
              aria-label="Close video"
              className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-panel text-ink transition-colors hover:bg-panel2"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <div className={`${aspectRatioClassName} w-full overflow-hidden rounded-sm border border-line-strong bg-void`}>
              <iframe
                src={buildEmbedUrl(openVideoId)}
                title="Video review"
                className="h-full w-full"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
