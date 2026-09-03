"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LivingBrainLogo } from "../brand/LivingBrainLogo";
import LanguageToggle from "../LanguageToggle";
import { HABIT_BUILDER_SIGNUP_HREF } from "@/config/habitBuilderSignupLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Distraction-Free Landing Nav™ — same minimal pattern as QsrNav.tsx (one
// path forward, no cross-page links), but the primary CTA is a signup
// link, not a payment link — Days 1-7 are free, so the real first ask on
// this page is "create an account," not "pay."
export default function HabitBuilderNav(): React.JSX.Element {
  const { t } = useLanguage();
  const habitBuilder = t.habitBuilderLanding;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-mono text-sm tracking-[0.06em]">
          <LivingBrainLogo size={24} decorative={false} animated={false} />
          <span className="hidden sm:inline">MIND UR MIND</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageToggle />
          <Link
            href={HABIT_BUILDER_SIGNUP_HREF}
            onClick={() => trackGaEvent("signup_cta_click", { location: "habit_builder_nav" })}
            className="rounded-sm bg-gold px-4 py-2 text-[13px] font-semibold text-[#1B1508] transition-transform hover:-translate-y-0.5 hover:bg-[#cb9a44]"
          >
            {habitBuilder.hero.navCta}
          </Link>
        </div>
      </nav>
    </header>
  );
}
