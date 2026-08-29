"use client";

import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Honest Trust Badge™ — deliberately NOT a "risk-free" or "money-back
// guarantee" claim: no such policy exists (Terms of Service explicitly
// states fees are non-refundable except where required by law), and this
// sits next to a real ₹4,999 checkout button, so a fabricated guarantee
// here would be a real, live false claim. What IS true and worth
// surfacing instead: enrollment is confirmed by a real person on Dr.
// Kapil's team, not an automated system — see masterclassPaymentLink.ts.
export default function QsrTrustBadge(): React.JSX.Element {
  const { t } = useLanguage();
  const badge = t.qsrLanding.trustBadge;

  return (
    <div className="flex max-w-sm items-start gap-3 rounded-sm border border-line-strong bg-panel2 px-4 py-3.5">
      <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-gold" aria-hidden="true" />
      <div>
        <p className="text-[13.5px] font-semibold text-ink">{badge.title}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-dim">{badge.desc}</p>
        <p className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
          {badge.secondaryLine}
        </p>
      </div>
    </div>
  );
}
