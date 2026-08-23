"use client";

import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "./LanguageToggle";

export default function Navbar(): React.JSX.Element {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-void/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-content items-center justify-between gap-6 px-6 py-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5 font-mono text-sm tracking-[0.06em]">
          <span className="relative block h-6 w-6 rounded-full border border-gold">
            <span className="absolute inset-[5px] rounded-full border border-gold/60" />
          </span>
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
            href="#tier-4"
            className="hidden rounded-sm border border-teal/60 px-4 py-2 text-[13px] font-semibold text-teal transition-colors hover:bg-teal-soft sm:inline-block"
          >
            {t.nav.ctaSecondary}
          </a>
          <a
            href="#tier-1"
            className="rounded-sm bg-gold px-4 py-2 text-[13px] font-semibold text-[#1B1508] transition-transform hover:-translate-y-0.5 hover:bg-[#e4be5e]"
          >
            {t.nav.ctaPrimary}
          </a>
        </div>
      </nav>
    </header>
  );
}
