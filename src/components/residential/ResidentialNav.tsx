"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { LivingBrainLogo } from "../brand/LivingBrainLogo";
import LanguageToggle from "../LanguageToggle";
import { WHATSAPP_RESIDENTIAL_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Distraction-Free Landing Nav™ — same pattern as QsrNav.tsx/RetreatNav.tsx.
// The primary CTA goes to WhatsApp, not a Razorpay link — there's no
// hosted checkout for the Residential Retreats (real ₹35,000/₹45,000
// pricing exists, but seat confirmation is handled personally by Dr.
// Kapil's team given the small-cohort, multi-venue logistics).
export default function ResidentialNav(): React.JSX.Element {
  const { t } = useLanguage();
  const residential = t.residentialLanding;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-mono text-sm tracking-[0.06em]">
          <LivingBrainLogo size={24} decorative={false} animated={false} />
          <span className="hidden sm:inline">MIND UR MIND</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageToggle />
          <a
            href={WHATSAPP_RESIDENTIAL_INQUIRY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("whatsapp_click", { location: "residential_nav" })}
            className="rounded-sm bg-gold px-4 py-2 text-[13px] font-semibold text-[#1B1508] transition-transform hover:-translate-y-0.5 hover:bg-[#cb9a44]"
          >
            {residential.hero.ctaPrimary}
          </a>
        </div>
      </nav>
    </header>
  );
}
