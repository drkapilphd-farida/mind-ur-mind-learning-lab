'use client'

type QuantumJourneyErrorScreenProps = {
  message: string
  onRetry: () => void
  onReturnToDashboard?: () => void
  onContinuePrevious?: () => void
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.5: Reading Journey
// UX & Navigation™. Objective 11 — never a raw technical error banner
// inside the journey itself: a warm, specific message plus real forward
// paths (Retry, Continue Previous Chapter, Return to Dashboard), never a
// dead end. `message` itself is still the real, honest error text the
// server action returned (never fabricated) — only the surrounding frame
// and the recovery actions are new.
export function QuantumJourneyErrorScreen({ message, onRetry, onReturnToDashboard, onContinuePrevious }: QuantumJourneyErrorScreenProps): React.JSX.Element {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-destructive/25 bg-destructive/[0.03] px-6 py-10 text-center" role="alert">
      <p className="text-sm font-semibold text-foreground">We couldn&apos;t prepare this chapter yet.</p>
      <p className="text-xs text-muted-foreground">{message}</p>
      <div className="mt-2 flex flex-col items-center gap-2">
        <button onClick={onRetry} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80">
          Try Again
        </button>
        {onContinuePrevious && (
          <button onClick={onContinuePrevious} className="text-sm text-muted-foreground hover:text-foreground">
            Continue Previous Chapter
          </button>
        )}
        {onReturnToDashboard && (
          <button onClick={onReturnToDashboard} className="text-sm text-muted-foreground hover:text-foreground">
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  )
}
