import { Eyebrow, CtaButton } from "../ui";
import VideoReviewGrid from "../VideoReviewGrid";
import { QSR_ADULT_VIDEO_REVIEWS } from "@/config/qsrVideoReviews";
import { PREFRONTAL_POWER_REGISTRATION_URL } from "@/config/whatsappSupportLink";

// Mandatory section, real assets only™ — reuses the same three real,
// already-vetted, adult-classified video testimonials (with real local
// thumbnails) already live on the QSR and Franchise pages, via the same
// shared VideoReviewGrid lazy-facade component — no new video component,
// no invented URLs, no invented names. These people are Quantum Speed
// Reading students, not PREfrontal POWER attendees (this workshop hasn't
// run yet) — labeled honestly as such, never implied otherwise.
export default function PrefrontalPowerTestimonials(): React.JSX.Element {
  return (
    <section className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 max-w-xl text-center sm:mx-auto">
          <div className="flex justify-center">
            <Eyebrow color="text-gold">Real People. Real Experiences.</Eyebrow>
          </div>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-dim">
            Hear from people who have experienced Mind Ur Mind programs and workshops.
          </p>
        </div>

        <VideoReviewGrid
          videos={QSR_ADULT_VIDEO_REVIEWS}
          aspectRatioClassName="aspect-[9/16]"
          cardLabel="Quantum Speed Reading Program"
          className="mx-auto max-w-3xl"
        />

        {/* One of only three CTA placements on this page (Hero, here,
            Final CTA), per explicit "do not overuse CTA" instruction. */}
        <div className="mt-12 flex justify-center">
          <CtaButton href={PREFRONTAL_POWER_REGISTRATION_URL} variant="primary" accent="gold" openInNewTab>
            Reserve My Seat
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
