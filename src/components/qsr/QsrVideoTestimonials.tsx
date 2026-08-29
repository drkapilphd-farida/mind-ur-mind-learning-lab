"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import {
  SUCCESS_STORIES_PLAYLIST_EMBED_URL,
  SUCCESS_STORIES_PLAYLIST_WATCH_URL,
} from "@/config/reviewsPlaylist";

// Replaces the plain text-only <Testimonials /> section on this page.
// No per-video thumbnails/names are fabricated: without a YouTube Data
// API key wired up, there's no real way to know which specific video in
// the 200+ playlist belongs to which named quote below, so the real
// playlist is embedded directly (same approach as /reviews).
//
// Testimonial Pool Separation™ — of the 4 real quotes in
// t.testimonials.items, only the first (Ananya R.) is genuinely about
// Quantum Speed Reading; the rest are real but from other programs
// (Retreat, Personal Class, Overthinking Mastery). Rather than
// fabricating 3 more on-topic quotes, the on-topic one is featured
// prominently and the rest are shown honestly labeled as students from
// other programs. Indexed by position, not by matching `program` text,
// since that field is translated per-language.
export default function QsrVideoTestimonials(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.videoTestimonials;
  const [featured, ...others] = t.testimonials.items;

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
              {featured.program}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
              {section.moreLabel}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <div key={item.name} className="flex flex-col rounded-sm border border-line bg-panel p-6">
                  <p className="mb-5 flex-1 text-[14px] italic leading-relaxed text-ink">&ldquo;{item.quote}&rdquo;</p>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink">{item.name}</div>
                    <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
                      {item.program}
                    </div>
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
