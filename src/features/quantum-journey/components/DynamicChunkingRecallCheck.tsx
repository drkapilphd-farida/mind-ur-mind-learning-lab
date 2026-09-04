'use client'

import { Brain } from 'lucide-react'
import { playClickChime } from '@/app/unified-quantum-session-preview/components/soundEngine'

type DynamicChunkingRecallCheckProps = {
  // The real Brain Challenge tally from the just-finished Dynamic
  // Chunking mission (ProgressiveChunkReadingExperience already runs one
  // genuine retention check per round internally — see that component's
  // own top-of-file comment) — shown here as real proof of what was just
  // measured, never a fabricated number.
  correctCount: number
  totalCount: number
  onComplete: () => void
}

type ConfidenceOption = { label: string; emoji: string }

const CONFIDENCE_OPTIONS: readonly ConfidenceOption[] = [
  { label: 'Locked it in', emoji: '💪' },
  { label: 'Mostly there', emoji: '🙂' },
  { label: 'Need more reps', emoji: '🌱' },
]

// Dynamic Chunking Feedback Loop Fix™ — Days 6, 12, and 18 (Dynamic
// Chunking) can't pair with the shared RetentionCheckPhase (its
// ReadingSet-shaped 2-question quiz needs a single fixed passage;
// Dynamic Chunking's own content engine is structurally different — see
// getReadingMode's own comment in quantumJourneyLevels.ts). Rather than
// dropping Step 4 entirely on those 3 days, this is the lightweight
// stand-in: a genuine one-click self-report, grounded in the real
// Brain-Challenge tally the mission itself already produced, that keeps
// every day's cue → routine → reward rhythm identical — a real Step 4
// still exists, it's just honestly a confidence check instead of a
// second quiz, rather than either fabricating quiz content or silently
// skipping the step.
export function DynamicChunkingRecallCheck({ correctCount, totalCount, onComplete }: DynamicChunkingRecallCheckProps): React.JSX.Element {
  // Confidence Tap Feedback™ — this self-report previously had zero
  // audio/haptic feedback at all (the most audio/haptic-bare tappable
  // moment in the journey); a light neutral tap (never correct/wrong,
  // since there's no right answer here) now gives it parity with every
  // other tappable moment in the app.
  function handleSelect(): void {
    playClickChime()
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(12)
    onComplete()
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
        <Brain className="size-6" />
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Quick Recall Check</p>
        <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground">How much of that stuck?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You answered {correctCount} of {totalCount} Brain Challenges correctly during today&rsquo;s chunking rounds. Be honest with yourself —
          how confident do you feel about what you just read?
        </p>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        {CONFIDENCE_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={handleSelect}
            className="flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/60 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 active:scale-95"
          >
            <span aria-hidden="true">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
