import { Target } from 'lucide-react'
import { DIFFICULTY_LEVEL_THRESHOLDS } from '../../adaptive/difficultyCalculator'
import type { AdaptiveEngineResult } from '../../adaptive/types/adaptiveTypes'

const CHALLENGE_SELECTION_LABEL: Record<AdaptiveEngineResult['recommendation']['recommendedChallenge'], string> = {
  'repeat-previous': 'Repeat your previous challenge',
  'move-to-next': 'Move to the next challenge',
  'suggest-easier': 'Try an easier challenge',
  'suggest-harder': 'Try a more difficult challenge',
}

function nextUnlockText(engineResult: AdaptiveEngineResult): string {
  const { nextLevel, nextLevelName } = engineResult.levelProgress
  if (nextLevel === null || nextLevelName === null) return 'All levels unlocked'
  const threshold = DIFFICULTY_LEVEL_THRESHOLDS.find((t) => t.level === nextLevel)
  if (!threshold) return nextLevelName
  return threshold.streakThreshold === 0
    ? `${nextLevelName} — ${threshold.sessionThreshold} sessions`
    : `${nextLevelName} — ${threshold.sessionThreshold} sessions, ${threshold.streakThreshold}-day streak`
}

type AdaptiveDashboardWidgetProps = {
  engineResult: AdaptiveEngineResult
}

// Reusable widget — Today's Goal, Current Level, Recommended Exercise,
// Next Unlock. Built standalone this sprint (rendered only on the new
// adaptive route); wiring it into the actual Dashboard is explicitly
// Sprint-9's job, not this sprint's.
export function AdaptiveDashboardWidget({ engineResult }: AdaptiveDashboardWidgetProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Target className="size-3.5" aria-hidden="true" />
        Visual Intelligence
      </div>
      <dl className="mt-4 space-y-3 text-left text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Today&apos;s Goal</dt>
          <dd className="font-semibold text-foreground">{engineResult.recommendation.suggestedGoal}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Current Level</dt>
          <dd className="font-semibold text-foreground">{engineResult.difficultyLevelName}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Recommended Exercise</dt>
          <dd className="text-right font-semibold text-foreground">{CHALLENGE_SELECTION_LABEL[engineResult.recommendation.recommendedChallenge]}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Next Unlock</dt>
          <dd className="text-right font-semibold text-foreground">{nextUnlockText(engineResult)}</dd>
        </div>
      </dl>
    </div>
  )
}
