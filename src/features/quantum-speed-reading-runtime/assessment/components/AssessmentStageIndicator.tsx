import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { ASSESSMENT_STAGE_ORDER, type AssessmentStageId } from '../selectAssessmentPassages'

const STAGE_LABEL: Record<AssessmentStageId, string> = {
  'word-chunk': 'Word Chunk',
  'phrase-chunk': 'Phrase Chunk',
  sentence: 'Sentence',
  paragraph: 'Paragraph',
}

type AssessmentStageIndicatorProps = {
  currentStage: AssessmentStageId
}

// Reading Assessment Engine™ — "Stage N of 4" + estimated-remaining
// framing. No generic multi-step indicator exists anywhere reusable in
// this codebase (the closest prior art, the Labs-only
// `SprintStepIndicator.tsx`, is itself deliberately local per its own
// comment) — this mirrors that same dot/line/label pattern, kept small
// and local to this feature.
export function AssessmentStageIndicator({ currentStage }: AssessmentStageIndicatorProps): React.JSX.Element {
  const currentIndex = ASSESSMENT_STAGE_ORDER.indexOf(currentStage)
  const remainingStages = ASSESSMENT_STAGE_ORDER.length - currentIndex - 1

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {ASSESSMENT_STAGE_ORDER.map((stage, index) => (
          <div key={stage} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-(--duration-base)', index <= currentIndex ? 'bg-primary' : 'bg-muted')} />
        ))}
      </div>
      <p className={cn(TYPOGRAPHY.caption, 'text-center text-muted-foreground')}>
        Stage {currentIndex + 1} of {ASSESSMENT_STAGE_ORDER.length} — {STAGE_LABEL[currentStage]} Reading
        {remainingStages > 0 && ` · about ${remainingStages + 1} min left`}
      </p>
    </div>
  )
}
