'use client'

import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'

export type AssessmentPace = 'slow' | 'comfortable' | 'fast'

type AssessmentSpeedPickerProps = {
  onSelect: (pace: AssessmentPace) => void
}

const PACE_OPTIONS: readonly { id: AssessmentPace; label: string }[] = [
  { id: 'slow', label: 'Slow & Careful' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'fast', label: 'Fast' },
]

// Reading Assessment Engine™ — "User chooses reading speed... AI must
// NEVER choose speed... the purpose is measurement, not coaching." This
// is a real, self-selected pace label, purely descriptive — it never
// paces content reveal (that would be the AI choosing speed on the
// learner's behalf). Real WPM comes only from real elapsed reading time,
// exactly like every other mode in this feature. Modeled directly on
// `ReadingSprintView.tsx`'s own duration-picker pattern
// (`SPRINT_DURATIONS_SECONDS` button grid).
export function AssessmentSpeedPicker({ onSelect }: AssessmentSpeedPickerProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
      <p className={TYPOGRAPHY.h4}>How do you plan to read this?</p>
      <div className="flex gap-3">
        {PACE_OPTIONS.map((option) => (
          <Button key={option.id} variant="outline" onClick={() => onSelect(option.id)}>
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
