"use client";

import Image from "next/image";
import { Eyebrow } from "./ui";

type GuideProfileCardProps = {
  eyebrow: string;
  title: string;
  credential: string;
  bio: string;
  stats: readonly { value: string; label: string }[];
  quote: string;
  accent?: "rose" | "gold" | "teal";
  // Optional CTA rendered below the quote — undefined (the default)
  // preserves every existing caller's exact current behavior (no CTA).
  ctaLabel?: string;
  ctaHref?: string;
  // Which approved founder photo to show — defaults to the original
  // /founder-warm.jpg so every existing caller's exact current behavior
  // is unchanged unless it explicitly opts into one of the newer
  // per-purpose approved assets (dr-kapil-*.png.png).
  imageSrc?: string;
};

const ACCENT_CLASSES = {
  rose: { eyebrow: "text-rose", ring: "border-rose/50", quote: "border-rose/40" },
  gold: { eyebrow: "text-gold", ring: "border-gold/50", quote: "border-gold/40" },
  teal: { eyebrow: "text-teal", ring: "border-teal/50", quote: "border-teal/40" },
} as const;

// The Guide™ — Dr. Kapil Dev Sharma's bio card, shared verbatim across
// every offer's landing page (Personal Class, the Overthinking Mastery
// Course, and any future one) rather than re-authored per page — the
// bio, stats, and quote are the same real facts regardless of which
// offer is being sold. Only the accent color and section eyebrow/title
// vary per page's own i18n copy.
export default function GuideProfileCard({
  eyebrow,
  title,
  credential,
  bio,
  stats,
  quote,
  accent = "rose",
  ctaLabel,
  ctaHref,
  imageSrc = "/founder-warm.jpg",
}: GuideProfileCardProps): React.JSX.Element {
  const accentClasses = ACCENT_CLASSES[accent];

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color={accentClasses.eyebrow}>{eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{title}</h2>
          <p className="mt-2 text-[13.5px] font-semibold text-ink-dim">{credential}</p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[200px_1fr] lg:items-start">
          <div className={`relative aspect-square w-full max-w-[200px] overflow-hidden rounded-sm border ${accentClasses.ring}`}>
            <Image src={imageSrc} alt={title} fill sizes="200px" className="object-cover object-top" />
          </div>

          <div>
            <p className="text-[16px] leading-relaxed text-ink-dim">{bio}</p>

            <div className="mt-7 grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-sm border border-line-strong bg-panel2 px-4 py-4 text-center">
                  <div className="font-display text-[26px] font-bold text-ink">{stat.value}</div>
                  <div className="mt-1 text-[11px] leading-snug text-ink-faint">{stat.label}</div>
                </div>
              ))}
            </div>

            <p className={`mt-7 border-l-2 pl-4 text-[15px] italic leading-relaxed text-ink ${accentClasses.quote}`}>
              &ldquo;{quote}&rdquo;
            </p>

            {ctaLabel !== undefined && ctaHref !== undefined && (
              <a
                href={ctaHref}
                className="group mt-7 inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink"
              >
                {ctaLabel}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
