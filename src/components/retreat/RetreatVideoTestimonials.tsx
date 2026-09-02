"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import VideoReviewGrid from "../VideoReviewGrid";
import { RETREAT_VIDEO_REVIEWS, RETREAT_VIDEO_REVIEWS_PLAYLIST_WATCH_URL } from "@/config/retreatVideoReviews";

// Real Retreat Video Reviews™ — this page previously reused the QSR
// page's shared 200+ video playlist embed and the shared
// t.testimonials.items text-quote pool, neither of which is
// retreat-specific. Replaced with 6 real, retreat-specific video reviews
// (RETREAT_VIDEO_REVIEWS), rendered through the same VideoReviewGrid
// gallery+lightbox used on /retreats/residential — real extracted
// thumbnails, no inline YouTube embed on the page itself.
//
// Vikram S.'s quote (programKey: 'retreat') is the one genuinely
// on-topic entry in the shared testimonials pool, so it stays as the
// featured text quote above the video grid.
export default function RetreatVideoTestimonials(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.retreatLanding.videoTestimonials;
  const featured = t.testimonials.items.find((item) => item.programKey === "retreat");

  return (
    <section id="testimonials" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        {featured !== undefined && (
          <div className="mb-10 rounded-sm border border-gold/40 bg-gold-soft/30 p-8">
            <p className="mb-5 text-[18px] italic leading-relaxed text-ink sm:text-[20px]">
              &ldquo;{featured.quote}&rdquo;
            </p>
            <div className="text-[14px] font-semibold text-ink">{featured.name}</div>
            <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-gold">
              {featured.context || featured.program}
            </div>
          </div>
        )}

        <VideoReviewGrid videos={RETREAT_VIDEO_REVIEWS} />

        <div className="mt-10 flex justify-center">
          <a
            href={RETREAT_VIDEO_REVIEWS_PLAYLIST_WATCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-sm border border-gold/50 px-7 py-[15px] text-[14.5px] font-semibold text-gold transition-colors hover:bg-gold-soft"
          >
            {section.ctaLabel}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
