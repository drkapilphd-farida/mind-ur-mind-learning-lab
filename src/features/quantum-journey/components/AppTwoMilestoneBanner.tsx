'use client'

import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from '@/config/masterclassPaymentLink'

type AppTwoMilestoneBannerProps = {
  day: 7 | 14
}

// Softer than AppTwoFinaleUpsellCta on purpose — Day 7 and Day 14 are
// real momentum checkpoints, not the finale, so this stays a quiet,
// dismissible mention rather than a hard sell.
const MILESTONE_COPY: Record<7 | 14, string> = {
  7: 'One real week down. Whenever you’re ready to point that speed at your own documents and books, App 2 — the 30-Day QSR Pro Suite — is here.',
  14: 'Two real weeks in. When you’re ready for the heavy-duty suite (Upload Documents, Neural Map Notes, Memory Techniques), App 2 is ₹4,999.',
}

// App 1 → App 2 Soft Upsell™ — shown only on the two real mid-journey
// momentum days (see MILESTONE_COPY), never nagging: one tap dismisses
// it for good on this screen, and no localStorage tracking is needed
// since QuantumJourneySession's own completion screen only ever renders
// once per genuine day-completion (see that component's own comment).
// Same real App 2 = 30-Day Masterclass ₹4,999 Razorpay link as
// AppTwoFinaleUpsellCta — one real checkout URL reused everywhere,
// never a second one that could drift.
export function AppTwoMilestoneBanner({ day }: AppTwoMilestoneBannerProps): React.JSX.Element | null {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="relative w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-muted-foreground/60 transition-colors hover:text-foreground"
        data-dismiss-app-two-banner="true"
      >
        <X className="size-4" aria-hidden="true" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          aria-hidden="true"
        >
          <Sparkles className="size-4" />
        </div>
        <p className="text-xs leading-relaxed text-foreground sm:text-sm">{MILESTONE_COPY[day]}</p>
      </div>

      <a
        href={RAZORPAY_MASTERCLASS_PAYMENT_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
      >
        Explore App 2 →
      </a>
    </div>
  )
}
