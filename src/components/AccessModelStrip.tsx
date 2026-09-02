"use client";

import { useLanguage } from "@/context/LanguageContext";

type AccessModelStripProps = {
  className?: string;
};

// The Access Model™ — one shared, reusable explainer for the two real
// pricing tiers: the Live Masterclass (₹4,999, one-time) and the
// post-program continuation plan (₹499/mo). Previously a 3-box strip
// that included a "free for 60 days" tier — removed per explicit
// correction: there is no free-access tier to the program itself (see
// getIsPaidUser.ts). What's genuinely free — the Reading Speed Test,
// the live intro session — lives in its own sections, never folded into
// this pricing explainer. Shown on both the homepage (TierFlagship) and
// the QSR landing page — one component, one translated copy, so the two
// pages can't drift out of sync.
export default function AccessModelStrip({ className = "" }: AccessModelStripProps): React.JSX.Element {
  const { t } = useLanguage();
  const a = t.accessModel;

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${className}`}>
      <div className="rounded-sm border border-gold/40 bg-gold-soft px-4 py-3.5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-gold">{a.masterclassLabel}</div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-dim">{a.masterclassDesc}</p>
      </div>
      <div className="rounded-sm border border-line-strong bg-panel2 px-4 py-3.5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">{a.continueLabel}</div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-dim">{a.continueDesc}</p>
      </div>
    </div>
  );
}
