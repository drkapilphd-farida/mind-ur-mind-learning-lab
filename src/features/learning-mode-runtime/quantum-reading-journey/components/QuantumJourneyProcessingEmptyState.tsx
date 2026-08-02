'use client'

import { Sparkles } from 'lucide-react'

type QuantumJourneyProcessingEmptyStateProps = {
  onCheckAgain: () => void
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.5: Reading Journey
// UX & Navigation™. Objective 10 — a calm, expected state, not an error:
// this document's AI processing hasn't finished yet. Distinct tone and
// framing from QuantumJourneyErrorScreen on purpose (Objective 11) — this
// is normal, not something gone wrong.
export function QuantumJourneyProcessingEmptyState({ onCheckAgain }: QuantumJourneyProcessingEmptyStateProps): React.JSX.Element {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-border/60 bg-muted/20 px-6 py-10 text-center">
      <Sparkles className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-semibold text-foreground">Your reading journey is being prepared.</p>
      <p className="text-xs text-muted-foreground">We&apos;re still finding the important ideas in this book. This usually only takes a few minutes.</p>
      <button onClick={onCheckAgain} className="rounded-full border border-border px-5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted">
        Check Again
      </button>
    </div>
  )
}
