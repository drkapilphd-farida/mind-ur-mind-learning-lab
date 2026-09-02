"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LivingBrainLogo } from "../brand/LivingBrainLogo";
import LanguageToggle from "../LanguageToggle";
import { CLASSPLUS_OVERTHINKING_COURSE_LINK } from "@/config/overthinkingCoursePaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Distraction-Free Landing Nav™ — same pattern as QsrNav.tsx/RetreatNav.tsx/
// ResidentialNav.tsx/MentoringNav.tsx, but styled dark specifically on
// this page (bg-[#12162a], matching CourseHero.tsx exactly) rather than
// the usual translucent-cream bg-void/85 — a light nav bar sitting flush
// against this page's new dark hero would otherwise create a visible
// seam. LivingBrainLogo's colorMode="dark" (renders pure white — see
// that component's own COLOR_STOPS) replaces the default full-color
// blue/green gradient mark, which reads poorly against navy. Sections
// below the hero return to the site's normal light treatment, so this
// dark nav is specific to this page only, not a new site-wide variant.
export default function CourseNav(): React.JSX.Element {
  const { t } = useLanguage();
  const course = t.courseLanding;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#12162a]/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-mono text-sm tracking-[0.06em] text-[#f5f1e6]">
          <LivingBrainLogo size={24} decorative={false} animated={false} colorMode="dark" />
          <span className="hidden sm:inline">MIND UR MIND</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageToggle variant="dark" />
          <a
            href={CLASSPLUS_OVERTHINKING_COURSE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("classplus_click", { location: "course_nav" })}
            className="rounded-sm bg-[#eb8a96] px-4 py-2 text-[13px] font-semibold text-[#12162a] transition-transform hover:-translate-y-0.5 hover:bg-[#f2a1ab]"
          >
            {course.hero.ctaPrimary}
          </a>
        </div>
      </nav>
    </header>
  );
}
