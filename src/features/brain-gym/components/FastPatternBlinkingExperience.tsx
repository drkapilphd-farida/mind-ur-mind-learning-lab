'use client'

import { BrainGymDrillExperience } from './BrainGymDrillExperience'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { FAST_PATTERN_BLINKING_CONFIG } from '../configs/fastPatternBlinkingConfig'

type FastPatternBlinkingExperienceProps = {
  onComplete?: () => void
  onExit?: () => void
}

export function FastPatternBlinkingExperience({ onComplete, onExit }: FastPatternBlinkingExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('fast-pattern-blinking', '/labs/quantum-speed-reading')
  return <BrainGymDrillExperience
      config={FAST_PATTERN_BLINKING_CONFIG}
      {...(curriculumSession.isActiveStep ? { onComplete: curriculumSession.advance } : onComplete !== undefined ? { onComplete } : {})}
      {...(onExit !== undefined ? { onExit } : {})}
    />
}
