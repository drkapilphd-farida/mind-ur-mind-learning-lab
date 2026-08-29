"use client";

import { useLanguage } from "@/context/LanguageContext";

type AccessModelStripProps = {
  className?: string;
};

// The Access Model™ — one shared, reusable explainer for how free access,
// the Live Masterclass, and the continuation plan relate: every new
// signup gets 60 free days of the real curriculum + app practice
// (getIsPaidUser's free window, see supabase/migrations/20260826000001_...),
// then either joins a live batch (₹4,999, one-time) or keeps practicing
// for ₹499/mo. Shown on both the homepage (TierFlagship) and the QSR
// landing page (hero + final CTA) — one component, one translated copy,
// so the two pages can't drift out of sync on this again.
export default function AccessModelStrip({ className = "" }: AccessModelStripProps): React.JSX.Element {
  const { t } = useLanguage();
  const a = t.accessModel;

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${className}`}>
      <div className="rounded-sm border border-teal/40 bg-teal-soft px-4 py-3.5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-teal">{a.freeLabel}</div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-dim">{a.freeDesc}</p>
      </div>
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
