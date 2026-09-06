"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LivingBrainLogo } from "./brand/LivingBrainLogo";
import LanguageToggle from "./LanguageToggle";
import { HABIT_BUILDER_APP_URL } from "@/config/habitBuilderSignupLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Clean Mobile Menu™ — the desktop link list was previously just hidden
// below lg: with no fallback at all, so mobile visitors had no way to
// reach Retreats/Mentoring/About/FAQ except by scrolling. A simple
// toggle panel (no animation library, plain Tailwind transitions,
// consistent with this codebase's existing hand-rolled disclosure
// patterns) fixes that without adding a dependency.
export default function Navbar(): React.JSX.Element {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-void/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-content items-center justify-between gap-6 px-6 py-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5 font-mono text-sm tracking-[0.06em]">
          <LivingBrainLogo size={24} decorative={false} animated={false} />
          MIND UR MIND
        </a>

        <div className="hidden items-center gap-8 text-[13.5px] text-ink-dim lg:flex">
          {t.nav.links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageToggle />
          <a
            href={HABIT_BUILDER_APP_URL}
            onClick={() => trackGaEvent("signup_cta_click", { location: "home_navbar" })}
            className="hidden rounded-sm bg-gold px-4 py-2 text-[13px] font-semibold text-[#1B1508] transition-transform hover:-translate-y-0.5 hover:bg-[#cb9a44] sm:inline-flex"
          >
            {t.nav.ctaPrimary}
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong text-ink lg:hidden"
          >
            {menuOpen ? <X className="h-4.5 w-4.5" aria-hidden="true" /> : <Menu className="h-4.5 w-4.5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-line bg-void px-6 py-5 sm:px-8 lg:hidden">
          <div className="flex flex-col gap-4 text-[14.5px] text-ink-dim">
            {t.nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href={HABIT_BUILDER_APP_URL}
            onClick={() => trackGaEvent("signup_cta_click", { location: "home_navbar_mobile" })}
            className="mt-5 flex items-center justify-center rounded-sm bg-gold px-4 py-3 text-[13.5px] font-semibold text-[#1B1508]"
          >
            {t.nav.ctaPrimary}
          </a>
        </div>
      )}
    </header>
  );
}
