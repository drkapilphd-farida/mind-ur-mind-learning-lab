"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import VideoReviewGrid from "../VideoReviewGrid";
import { RETREAT_VIDEO_REVIEWS, RETREAT_VIDEO_REVIEWS_PLAYLIST_WATCH_URL } from "@/config/retreatVideoReviews";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Real Retreat Video Reviews™ — same shared 6-video gallery+lightbox as
// the Online 11-Day Retreat page (see retreatVideoReviews.ts and
// VideoReviewGrid.tsx): real students speaking to the retreat experience
// generally, not specific to one format. Previously this page embedded 4
// individually-selected videos inline via its own
// residentialRetreatMedia.ts config — consolidated into the same shared
// set both retreat pages now use, real extracted thumbnails instead of
// an inline YouTube iframe per video.
export default function ResidentialVideoTestimonials(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.residentialLanding.videoTestimonials;

  return (
    <section id="testimonials" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <VideoReviewGrid videos={RETREAT_VIDEO_REVIEWS} />

        <div className="mt-10 flex justify-center">
          <a
            href={RETREAT_VIDEO_REVIEWS_PLAYLIST_WATCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("video_testimonial_click", { location: "residential_watch_more_videos" })}
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
