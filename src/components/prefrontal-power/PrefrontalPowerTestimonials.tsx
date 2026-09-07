"use client";

import { useState } from "react";
import { Eyebrow, CtaButton } from "../ui";
import VideoReviewGrid from "../VideoReviewGrid";
import { PREFRONTAL_POWER_VIDEO_REVIEWS } from "@/config/prefrontalPowerVideoReviews";
import { PREFRONTAL_POWER_REGISTRATION_URL } from "@/config/whatsappSupportLink";

const VISIBLE_COUNT = 4;
const INITIAL_VIDEOS = PREFRONTAL_POWER_VIDEO_REVIEWS.slice(0, VISIBLE_COUNT);
const REMAINING_COUNT = PREFRONTAL_POWER_VIDEO_REVIEWS.length - VISIBLE_COUNT;

// V3 — this is the single highest-priority addition of this pass: a
// prominent, above-the-curriculum trust section using 11 real,
// individually-supplied YouTube Shorts. No verified name/program exists
// for any of them yet, so every card is honestly captioned "Participant
// Experience" rather than inventing a name or implying PREfrontal POWER
// attendance (the workshop hasn't run yet).
//
// Desktop shows exactly 4 up front (2x2 on mobile via VideoReviewGrid's
// gridClassName override); "Watch More Reviews" expands the remaining 7
// inline (Option A from the brief) rather than opening a second modal
// layer on top of the lightbox VideoReviewGrid already has.
export default function PrefrontalPowerTestimonials(): React.JSX.Element {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 max-w-xl text-center sm:mx-auto">
          <div className="flex justify-center">
            <Eyebrow color="text-gold">Real People. Real Experiences.</Eyebrow>
          </div>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-dim">
            Hear directly from participants who have experienced Mind Ur Mind programs and workshops.
          </p>
        </div>

        <VideoReviewGrid
          videos={showAll ? PREFRONTAL_POWER_VIDEO_REVIEWS : INITIAL_VIDEOS}
          aspectRatioClassName="aspect-[9/16]"
          cardLabel="Participant Experience"
          gridClassName="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
          className="mx-auto max-w-4xl"
        />

        {!showAll && (
          <div className="mt-9 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="group inline-flex items-center gap-2 font-mono text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:text-gold"
            >
              Watch More Reviews ({REMAINING_COUNT})
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <CtaButton href={PREFRONTAL_POWER_REGISTRATION_URL} variant="primary" accent="gold" openInNewTab>
            Reserve My Seat
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
