'use client'

import { ProgressRing } from '@/components/exercises/ProgressRing'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { useCountUp } from '@/hooks/exercises/useCountUp'

type TodaysProgressProps = {
  completedStageCount: number
  totalStageCount: number
  mindScore: number
  mindScoreLabel: string
}

// Sprint-12F — Founder Journey Redesign™, replaces BrainTransformationMetrics™
// (a 6-ring grid: Mind Score™ + 4 ability rings + Consistency). Per the
// brief, progress on Lab Home must answer exactly one question — "how far
// have I come" — not read as an analytics panel. One ring, one number:
// stages complete out of the whole journey. Mind Score™ is kept as a
// quiet secondary line (not a second ring) since it's the app's one
// flagship metric across every sprint so far — dropping it entirely would
// lose real, already-computed information the learner has been shown
// consistently; demoting it to plain text (instead of a ring the same
// visual weight as the primary one) is what keeps this "simple, elegant"
// rather than a stats dashboard. The per-ability breakdown is removed
// entirely from Lab Home — reuses the existing, already-animated
// ProgressRing (src/components/exercises/ProgressRing.tsx), no new
// visual primitive.
//
// Sprint-16 — Delight Layer™. The ring's label and the two lines beneath
// it used to show their final numbers instantly while only the ring
// stroke animated. Reuses the same useCountUp hook that already drives
// ProgressRing internally — this component becomes a Client Component
// (a small, leaf-level boundary, not an architecture change) so the
// count-up can run here without touching ProgressRing's shared API
// (used across ~28 other files).
export function TodaysProgress({
  completedStageCount,
  totalStageCount,
  mindScore,
  mindScoreLabel,
}: TodaysProgressProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animatedCompletedStageCount = useCountUp(completedStageCount, 700, prefersReducedMotion)
  const animatedMindScore = useCountUp(mindScore, 700, prefersReducedMotion)
  const roundedCompletedStageCount = Math.round(animatedCompletedStageCount)
  const roundedMindScore = Math.round(animatedMindScore)

  return (
    <div className="animate-in fade-in flex flex-col items-center gap-3 rounded-3xl border bg-card p-8 text-center shadow-sm duration-(--duration-slow) ease-out sm:p-10">
      <ProgressRing
        progress={totalStageCount > 0 ? completedStageCount / totalStageCount : 0}
        size={96}
        label={`${roundedCompletedStageCount}/${totalStageCount}`}
        accessibleLabel={`${completedStageCount} of ${totalStageCount} stages complete`}
      />
      <p className="mt-1 text-sm font-medium text-foreground">
        {roundedCompletedStageCount} of {totalStageCount} Stages Complete
      </p>
      <p className="text-xs text-muted-foreground">
        Mind Score™ {roundedMindScore} · {mindScoreLabel}
      </p>
    </div>
  )
}
