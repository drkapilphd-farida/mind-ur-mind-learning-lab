"use client";

import Link from "next/link";
import { LivingBrainLogo } from "./brand/LivingBrainLogo";
import LanguageToggle from "./LanguageToggle";

// Minimal header for informational pages (Contact, About) that aren't
// single-offer conversion funnels — Navbar.tsx's nav links are hash
// anchors into the homepage's own sections and don't resolve on other
// pages, so it isn't reusable here. Just the logo (linking home) and the
// language toggle, same restrained approach as QsrNav.tsx and siblings,
// minus the offer-specific CTA those pages have and this one doesn't.
export default function SimplePageNav(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-content items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-mono text-sm tracking-[0.06em]">
          <LivingBrainLogo size={24} decorative={false} animated={false} />
          <span>MIND UR MIND</span>
        </Link>
        <LanguageToggle />
      </nav>
    </header>
  );
}
