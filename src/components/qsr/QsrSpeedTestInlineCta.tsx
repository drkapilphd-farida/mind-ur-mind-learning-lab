"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

type QsrSpeedTestInlineCtaProps = {
  variant: "afterScience" | "beforePricing";
};

// Reading Speed Test CTA, Repeated™ — same button style and exact copy
// (t.qsrLanding.hero.ctaSecondary) as the hero's existing speed-test
// link, so all three placements on this page read as one intentional
// path rather than three different features. Only the lead-in line
// above the button changes per placement.
export default function QsrSpeedTestInlineCta({ variant }: QsrSpeedTestInlineCtaProps): React.JSX.Element {
  const { t } = useLanguage();
  const heading = t.qsrLanding.speedTestCta[variant];

  return (
    <section className="border-b border-line px-6 py-14 sm:px-8">
      <div className="mx-auto flex max-w-content flex-col items-center gap-5 text-center">
        <p className="max-w-lg text-[16px] font-semibold leading-relaxed text-ink">{heading}</p>
        <Link
          href="/programs/quantum-speed-reading/speed-test"
          className="group inline-flex items-center gap-2.5 rounded-sm border border-teal/60 px-7 py-[15px] text-[14.5px] font-semibold text-teal transition-colors hover:bg-teal-soft"
        >
          {t.qsrLanding.hero.ctaSecondary}
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
}
