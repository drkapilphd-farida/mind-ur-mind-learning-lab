"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";

type PhotoPlaceholderProps = {
  // Once a real file exists (see residentialGalleryPhotos.ts — the single
  // place these are wired in), pass its /public path here and this
  // renders a real next/image. Leave undefined and it renders a clearly
  // labeled placeholder instead, so the page never ships a broken image.
  src?: string | undefined;
  alt: string;
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  // "card": bordered box, centered icon + label — for slots inside a
  // card layout (venues, gallery tiles, the teaching photo).
  // "subtle": low-opacity wash with a small corner tag — for full-bleed
  // backgrounds sitting behind text (the hero), where a bold placeholder
  // would fight with the headline for attention.
  variant?: "card" | "subtle";
};

export default function PhotoPlaceholder({
  src,
  alt,
  label,
  className = "",
  sizes = "100vw",
  priority = false,
  variant = "card",
}: PhotoPlaceholderProps): React.JSX.Element {
  // The outer div carries the consumer's `className` verbatim — including,
  // for the hero, "absolute inset-0". An inner div always gets `relative`
  // instead of putting it on the same element as `className`: Tailwind's
  // fixed utility ordering makes `.relative` win over `.absolute` when
  // both land on one element regardless of source order, which silently
  // collapsed this layer to zero height before this split existed.
  if (src !== undefined) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <div className="relative h-full w-full">
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      </div>
    );
  }

  if (variant === "subtle") {
    return (
      <div
        className={`overflow-hidden bg-panel2 bg-[radial-gradient(circle_at_30%_20%,rgba(184,134,46,0.14),transparent_60%)] ${className}`}
        aria-hidden="true"
      >
        <div className="relative h-full w-full">
          {/* top-right, not bottom-right — this variant is used
              full-bleed behind hero content, and the floating WhatsApp
              widget always sits bottom-right, so a bottom tag would sit
              hidden under it. */}
          <span className="absolute right-3 top-3 rounded-full border border-line-strong bg-void/70 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-faint backdrop-blur-sm">
            {label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden border border-dashed border-line-strong bg-panel2 bg-[radial-gradient(circle_at_50%_40%,rgba(184,134,46,0.10),transparent_65%)] ${className}`}
    >
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <ImageIcon className="h-6 w-6 text-ink-faint" aria-hidden="true" />
        <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-faint">{label}</p>
      </div>
    </div>
  );
}
