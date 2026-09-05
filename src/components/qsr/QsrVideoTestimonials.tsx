"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import VideoReviewGrid from "../VideoReviewGrid";
import {
  QSR_ADULT_VIDEO_REVIEWS,
  QSR_YOUNG_LEARNER_VIDEO_REVIEWS,
  QSR_MORE_VIDEO_REVIEWS,
} from "@/config/qsrVideoReviews";
import { isRealUrl } from "@/lib/isRealUrl";

// Real Video Testimonial Showcase™ (Phase 6A) — replaces the previous
// single eagerly-loaded playlist <iframe> with 6 hand-selected, real
// individual videos (3 Adults + 3 Young Learners), rendered through the
// same VideoReviewGrid gallery+lightbox component already used on the
// Retreat pages — real thumbnail, no YouTube iframe loaded until a card
// is clicked. The remaining 7 of the 13 supplied videos stay reachable
// (never hidden) behind the "Watch More Student Stories" toggle below.
// The old external 200+ video playlist CTA has been removed in favor of
// this in-page showcase.
//
// Testimonial Pool Separation™ (unchanged from earlier phases) — still
// filters t.testimonials.items by the stable, untranslated `programKey`
// field. None of the 13 newly supplied video URLs could be confidently
// mapped to a specific named quote below (no name/quote-to-video
// correspondence was supplied), so the `[VIDEO URL NEEDED]` placeholders
// on those quotes are left untouched rather than guessed at.
export default function QsrVideoTestimonials(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.videoTestimonials;
  const [featured, ...others] = t.testimonials.items.filter((item) => item.programKey === "qsr");
  const [showMoreVideos, setShowMoreVideos] = useState(false);

  // Visual Rhythm™ — lg:py-20 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section id="testimonials" className="border-b border-line px-6 py-24 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="mb-10">
          <p className="mb-4 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-gold">
            {section.adultsLabel}
          </p>
          <VideoReviewGrid videos={QSR_ADULT_VIDEO_REVIEWS} />
        </div>

        <div className="mb-10">
          <p className="mb-4 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-gold">
            {section.youngLearnersLabel}
          </p>
          <VideoReviewGrid videos={QSR_YOUNG_LEARNER_VIDEO_REVIEWS} />
        </div>

        <div className="mb-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShowMoreVideos((value) => !value)}
            aria-expanded={showMoreVideos}
            className="group inline-flex items-center gap-2.5 rounded-sm border border-gold/50 px-7 py-[15px] text-[14.5px] font-semibold text-gold transition-colors hover:bg-gold-soft"
          >
            {showMoreVideos ? section.watchFewerVideosLabel : section.watchMoreVideosLabel}
            <span
              className={`transition-transform duration-200 ${showMoreVideos ? "-rotate-90" : "rotate-90"}`}
              aria-hidden="true"
            >
              →
            </span>
          </button>
        </div>

        {showMoreVideos && <VideoReviewGrid videos={QSR_MORE_VIDEO_REVIEWS} className="mb-10" />}

        {featured !== undefined && (
          <div className="mb-10 rounded-sm border border-gold/40 bg-gold-soft/30 p-8">
            <p className="mb-5 text-[18px] italic leading-relaxed text-ink sm:text-[20px]">
              &ldquo;{featured.quote}&rdquo;
            </p>
            <div className="text-[14px] font-semibold text-ink">{featured.name}</div>
            <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-gold">
              {featured.context || featured.program}
            </div>
            {isRealUrl(featured.videoUrl) && (
              <a
                href={featured.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-gold hover:underline"
              >
                ▶ {section.watchLabel}
              </a>
            )}
          </div>
        )}

        {others.length > 0 && (
          <>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
              {section.moreLabel}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <div key={item.id} className="flex flex-col rounded-sm border border-line bg-panel p-6">
                  <p className="mb-5 flex-1 text-[14px] italic leading-relaxed text-ink">&ldquo;{item.quote}&rdquo;</p>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink">{item.name}</div>
                    <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
                      {item.context || item.program}
                    </div>
                    {isRealUrl(item.videoUrl) && (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-gold hover:underline"
                      >
                        ▶ {section.watchLabel}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
