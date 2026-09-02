"use client";

import { Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type PracticeDisclaimerProps = {
  className?: string;
  // Overrides the shared t.wellnessDisclaimer.line default — used by the
  // Personal Class Apply form, whose disclaimer is intentionally worded
  // more specifically ("coaching practice... therapy or psychiatric
  // care") than the general spiritual/energy-work wording that fits the
  // retreat pages.
  text?: string;
};

// Shared across every enrollment CTA for a spiritual/energy-work offering
// — both Retreat pages' final CTA, Residential's pricing section, and
// the homepage Personal Class mentoring card — sourced from one
// top-level i18n key (t.wellnessDisclaimer) by default, so the wording
// never drifts between placements, same pattern as CheckoutTrustLine.tsx.
// Deliberately NOT styled as fine print (no italic, no faint-on-faint
// text) — a bordered box with an icon, sized to actually be read.
export default function PracticeDisclaimer({ className = "", text }: PracticeDisclaimerProps): React.JSX.Element {
  const { t } = useLanguage();

  return (
    <div className={`flex items-start gap-2.5 rounded-sm border border-line-strong bg-panel2 px-4 py-3.5 ${className}`}>
      <Info className="mt-0.5 h-4 w-4 flex-none text-ink-faint" aria-hidden="true" />
      <p className="text-[12.5px] leading-relaxed text-ink-dim">{text ?? t.wellnessDisclaimer.line}</p>
    </div>
  );
}
