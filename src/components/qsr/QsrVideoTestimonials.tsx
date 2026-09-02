"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import {
  SUCCESS_STORIES_PLAYLIST_EMBED_URL,
  SUCCESS_STORIES_PLAYLIST_WATCH_URL,
} from "@/config/reviewsPlaylist";
import { isRealUrl } from "@/lib/isRealUrl";

// Replaces the plain text-only <Testimonials /> section on this page.
// No per-video thumbnails/names are fabricated: without a YouTube Data
// API key wired up, there's no real way to know which specific video in
// the 200+ playlist belongs to which named quote below, so the real
// playlist is embedded directly (same approach as /reviews).
//
// Testimonial Pool Separation™ — filters t.testimonials.items by the
// stable, untranslated `programKey` field (not array position, and not
// the translated `program` label — both of those broke or were fragile
// once more than one QSR-specific quote existed). Ananya R. is featured
// prominently; the remaining `qsr` entries (currently placeholders
// pending real quotes — see the bracketed text) fill the grid below,
// instead of padding it with genuinely off-topic quotes from other
// programs the way this section used to.
export default function QsrVideoTestimonials(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.videoTestimonials;
  const [featured, ...others] = t.testimonials.items.filter((item) => item.programKey === "qsr");

  return (
    <section id="testimonials" className="border-b border-line px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="mb-10 aspect-video w-full overflow-hidden rounded-sm border border-line-strong">
          <iframe
            src={SUCCESS_STORIES_PLAYLIST_EMBED_URL}
            title={section.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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

        <div className="mt-10 flex justify-center">
          <a
            href={SUCCESS_STORIES_PLAYLIST_WATCH_URL}
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
