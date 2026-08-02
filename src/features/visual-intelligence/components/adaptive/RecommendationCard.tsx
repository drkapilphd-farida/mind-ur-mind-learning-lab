import { Sparkles } from 'lucide-react'
import type { RecommendationCardData } from '../../adaptive/types/adaptiveTypes'
import { DIFFICULTY_LEVEL_NAME } from '../../adaptive/difficultyCalculator'

const CHALLENGE_SELECTION_LABEL: Record<RecommendationCardData['recommendedChallenge'], string> = {
  'repeat-previous': 'Repeat your previous challenge',
  'move-to-next': 'Move to the next challenge',
  'suggest-easier': 'Try an easier challenge',
  'suggest-harder': 'Try a more difficult challenge',
}

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes === 0) return `${seconds}s`
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`
}

type RecommendationCardProps = {
  recommendation: RecommendationCardData
}

// Daily Recommendation Card — every value here is a deterministic function
// of real stored session data (see recommendationEngine.ts), never random.
export function RecommendationCard({ recommendation }: RecommendationCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <Sparkles className="size-3.5" aria-hidden="true" />
        Today&apos;s Recommendation
      </div>

      <p className="mt-3 font-heading text-xl font-bold tracking-tight text-foreground">
        {CHALLENGE_SELECTION_LABEL[recommendation.recommendedChallenge]}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-left text-xs sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Suggested Duration</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{recommendation.suggestedDurationSeconds}s</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Suggested Difficulty</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{DIFFICULTY_LEVEL_NAME[recommendation.suggestedDifficulty]}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Suggested Goal</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{recommendation.suggestedGoal}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Estimated Training Time</dt>
          <dd className="mt-0.5 font-semibold text-foreground">{formatSeconds(recommendation.estimatedTrainingTimeSeconds)}</dd>
        </div>
      </dl>
    </div>
  )
}
