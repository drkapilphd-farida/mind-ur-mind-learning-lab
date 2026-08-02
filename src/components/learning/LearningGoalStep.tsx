'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UPLOAD_LEARNING_GOALS, type UploadLearningGoalId } from '@/constants/learning/uploadLearningGoals'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type LearningGoalStepProps = {
  recommendedGoalId: UploadLearningGoalId
  submitting: boolean
  onContinue: (goalId: UploadLearningGoalId) => void
  onBack: () => void
}

// AI Learning Studio™ V1 Launch UX Transformation — Screen 4, "Learning
// Goal." One question, four fixed options. `recommendedGoalId` is a
// coarse, disclosed heuristic off already-available signals (estimated
// reading time / format — computed in the wizard alongside Screen 3's own
// AI Detection values), never a claim of real document analysis — real
// per-document analysis (difficulty, memory density, etc.) doesn't exist
// until Processing. The learner may freely change the pre-selected option.
export function LearningGoalStep({ recommendedGoalId, submitting, onContinue, onBack }: LearningGoalStepProps): React.JSX.Element {
  const [selected, setSelected] = useState<UploadLearningGoalId>(recommendedGoalId)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {UPLOAD_LEARNING_GOALS.map((goal) => {
          const isSelected = selected === goal.id
          const isRecommended = goal.id === recommendedGoalId
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => setSelected(goal.id)}
              aria-pressed={isSelected}
              className={cn(
                'flex flex-col items-start gap-1 rounded-2xl border p-5 text-left transition-colors',
                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-accent/20',
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span aria-hidden="true" className="text-2xl">
                  {goal.emoji}
                </span>
                {isRecommended && (
                  <Badge variant="secondary" className="shrink-0">
                    Recommended
                  </Badge>
                )}
              </div>
              <p className={cn(TYPOGRAPHY.h4, 'mt-1')}>{goal.label}</p>
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        <Button type="button" size="lg" className="w-full rounded-full" loading={submitting} onClick={() => onContinue(selected)}>
          Start Learning <span aria-hidden="true">→</span>
        </Button>
        <Button type="button" variant="ghost" className="w-full" disabled={submitting} onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  )
}
