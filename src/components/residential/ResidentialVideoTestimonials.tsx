"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import {
  RESIDENTIAL_TESTIMONIAL_VIDEO_IDS,
  RESIDENTIAL_TESTIMONIALS_PLAYLIST_WATCH_URL,
  buildResidentialTestimonialEmbedUrl,
} from "@/config/residentialRetreatMedia";
import { trackGaEvent } from "@/lib/analytics/ga4";

// 4 real, individual video testimonials (given directly, not pulled via
// a Data API), each embedded on its own — different from the single
// "videoseries" playlist embed used on /reviews and the QSR/Online
// Retreat pages. "Watch More" points to the separate, broader playlist
// given specifically for this page.
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {RESIDENTIAL_TESTIMONIAL_VIDEO_IDS.map((videoId, index) => (
            <div key={videoId} className="aspect-video overflow-hidden rounded-sm border border-line-strong">
              <iframe
                src={buildResidentialTestimonialEmbedUrl(videoId)}
                title={`Real Student Story ${index + 1}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href={RESIDENTIAL_TESTIMONIALS_PLAYLIST_WATCH_URL}
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
