"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

type QsrGuaranteeBadgeProps = {
  className?: string;
};

// 7-Day Result Guarantee™ — the risk-reversal mechanism replacing the
// removed "free access" framing (see getIsPaidUser.ts and
// accessModel's doc comment). Deliberately specific and measurable
// ("7 days" + "WPM hasn't measurably improved"), never softened into
// vague "satisfaction guaranteed" language — that's the real policy.
// Links to the existing Refund & Cancellation Policy (Section 2 of
// /terms, already anchored at #billing — see CheckoutTrustLine.tsx)
// rather than duplicating its legal text here. Shown near the primary
// CTA in both the hero and the final batch-notice section.
export default function QsrGuaranteeBadge({ className = "" }: QsrGuaranteeBadgeProps): React.JSX.Element {
  const { t } = useLanguage();
  const g = t.qsrLanding.guarantee;

  return (
    <div className={`flex items-start gap-3 rounded-sm border border-gold/40 bg-gold-soft px-5 py-4 ${className}`}>
      <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-gold" aria-hidden="true" />
      <div>
        <div className="text-[13.5px] font-bold text-ink">{g.title}</div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-dim">
          {g.desc}{" "}
          <Link href="/terms#billing" className="underline decoration-ink-faint/50 underline-offset-2 hover:text-ink">
            {g.policyLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
