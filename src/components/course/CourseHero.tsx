"use client";

import { useLanguage } from "@/context/LanguageContext";
import { CLASSPLUS_OVERTHINKING_COURSE_LINK } from "@/config/overthinkingCoursePaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Dark Product Hero™ — deliberately breaks from the rest of the site's
// light cream sections for this one hero only (see CourseNav.tsx for the
// matching dark nav treatment that sits above it, so there's no light-
// bar-on-dark-hero seam). Everything below this section returns to the
// site's normal light .warm-light treatment — this is a bounded
// island, not a new site-wide theme.
export default function CourseHero(): React.JSX.Element {
  const { t } = useLanguage();
  const course = t.courseLanding;

  return (
    <section className="relative overflow-hidden bg-[#12162a] px-6 pb-20 pt-16 text-center sm:px-8 sm:pb-28 sm:pt-20">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(235,138,150,0.16),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-[#eb8a96]">
          {course.hero.eyebrow}
        </p>

        <p className="mt-4 font-display text-[16px] italic text-[#c7cae0] sm:text-[18px]">
          {course.hero.productName}
        </p>

        <h1 className="mt-3 text-[36px] font-extrabold leading-[1.1] tracking-tight text-[#f5f1e6] sm:text-[48px] lg:text-[56px]">
          {course.hero.headline}
        </h1>

        <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.1em] text-[#eb8a96]/90">
          {course.hero.tagline}
        </p>

        <p className="mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed text-[#aeb2c8] sm:text-[16.5px]">
          {course.hero.sub}
        </p>

        <div className="mt-9 flex justify-center">
          <a
            href={CLASSPLUS_OVERTHINKING_COURSE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("classplus_click", { location: "course_hero" })}
            className="group inline-flex items-center gap-2.5 rounded-sm bg-[#eb8a96] px-8 py-[17px] text-[15px] font-semibold text-[#12162a] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#f2a1ab]"
          >
            {course.hero.ctaPrimary}
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>

        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 border-t border-white/10 pt-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#8b8fa8]">
            {course.pricing.moreTimeLabel}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {course.pricing.tiers.map((tier) => (
              <div
                key={tier.days}
                className={`rounded-sm border px-4 py-2.5 text-center ${
                  tier.featured ? "border-[#eb8a96]/60 bg-[#eb8a96]/10" : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className={`text-[13.5px] font-bold ${tier.featured ? "text-[#f2a1ab]" : "text-[#e4e6f0]"}`}>
                  {tier.price}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.05em] text-[#8b8fa8]">
                  {tier.days}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] leading-relaxed text-[#8b8fa8]">{course.pricing.classplusNote}</p>
        </div>
      </div>
    </section>
  );
}
