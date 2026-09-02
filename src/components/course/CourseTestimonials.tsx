"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import VideoReviewGrid from "../VideoReviewGrid";
import type { RetreatVideoReview } from "@/config/retreatVideoReviews";

// Real Course Video Reviews™ — same VideoReviewGrid gallery+lightbox
// pattern already built for the retreat pages (real extracted
// thumbnails, click-to-open lightbox, no inline YouTube embed). Empty
// for now — deliberately not backfilled with QSR/retreat/Personal Class
// videos, which would misrepresent unrelated students as course
// reviewers. Real course-specific video IDs go in this array (with real
// extracted thumbnails under public/course-videos/, same convention as
// retreatVideoReviews.ts) once provided.
const COURSE_VIDEO_REVIEWS: readonly RetreatVideoReview[] = [];

export default function CourseTestimonials(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.courseLanding.testimonials;

  return (
    <section className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-rose">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
        </div>

        {COURSE_VIDEO_REVIEWS.length > 0 ? (
          <VideoReviewGrid videos={COURSE_VIDEO_REVIEWS} />
        ) : (
          <div className="rounded-sm border border-dashed border-line-strong bg-panel2 px-7 py-10 text-center">
            <p className="text-[13.5px] leading-relaxed text-ink-faint">{section.comingSoonNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}
