"use client";

import Link from "next/link";
import { LivingBrainLogo } from "../brand/LivingBrainLogo";
import LanguageToggle from "../LanguageToggle";
import { PREFRONTAL_POWER_REGISTRATION_URL } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Distraction-Free Landing Nav™ — same pattern as QsrNav.tsx/
// HabitBuilderNav.tsx (logo + language toggle + one primary CTA, no
// cross-page links). English-Only Launch™ — this page's own copy is
// hardcoded English (confirmed with the site owner: premium-editorial
// English for a Mumbai professional audience, no Hindi pass yet), so
// unlike every other landing nav on this site it doesn't read from
// `t.*` for its own CTA label. LanguageToggle is kept for visual
// consistency with the rest of the site's chrome, but toggling it will
// only translate the toggle/nav itself — this page's body content
// won't change language until a real Hindi pass is commissioned.
export default function PrefrontalPowerNav(): React.JSX.Element {
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
            href={PREFRONTAL_POWER_REGISTRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackGaEvent("whatsapp_click", { location: "prefrontal_power_nav" })}
            className="rounded-sm bg-gold px-4 py-2 text-[13px] font-semibold text-[#1B1508] transition-transform hover:-translate-y-0.5 hover:bg-[#cb9a44]"
          >
            Reserve My Seat
          </a>
        </div>
      </nav>
    </header>
  );
}
