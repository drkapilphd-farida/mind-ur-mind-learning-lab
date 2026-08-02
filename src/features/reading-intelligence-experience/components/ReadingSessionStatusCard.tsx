import type { ReadingSessionStatus } from '../types'

type ReadingSessionStatusCardProps = {
  status: ReadingSessionStatus
}

// New — "Session Status" (§ brief). A compact, standalone status readout
// distinct from JourneyHero's own greeting+CTA role (this composition's
// JourneyHero call deliberately omits currentExerciseTitle/exercisePosition
// to avoid showing the same exercise-level detail twice — see
// ReadingIntelligenceDashboardExperience.tsx's header comment). `aria-live`
// (Sprint 51) since this card's content changes as the learner progresses.
export function ReadingSessionStatusCard({ status }: ReadingSessionStatusCardProps): React.JSX.Element {
  return (
    <div
      aria-live="polite"
      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-card px-4 py-3 text-sm sm:px-5"
    >
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Stage {status.stagePosition.index} of {status.stagePosition.total}
        </p>
        <p className="mt-0.5 truncate font-medium text-foreground">{status.stageLabel}</p>
      </div>
      {status.exerciseLabel !== null && (
        <p className="shrink-0 text-muted-foreground">{status.exerciseLabel}</p>
      )}
    </div>
  )
}
