'use client'

type QuantumJourneyEmptyStageProps = {
  message: string
  onSkip: () => void
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2. Honest degradation
// for a stage whose real content pool was too small to build a real
// exercise from (e.g. buildWordFlashItems/buildProgressiveChunkReadingBlock
// returning empty/null for a short chapter) — never a crash, never
// fabricated content, always a real Continue forward.
export function QuantumJourneyEmptyStage({ message, onSkip }: QuantumJourneyEmptyStageProps): React.JSX.Element {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      <button
        onClick={onSkip}
        className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        Continue →
      </button>
    </div>
  )
}
