'use client'

import { BrainGymDrillExperience } from './BrainGymDrillExperience'
import { FAST_PATTERN_BLINKING_CONFIG } from '../configs/fastPatternBlinkingConfig'

type FastPatternBlinkingExperienceProps = {
  onComplete?: () => void
}

export function FastPatternBlinkingExperience({ onComplete }: FastPatternBlinkingExperienceProps = {}): React.JSX.Element {
  return <BrainGymDrillExperience config={FAST_PATTERN_BLINKING_CONFIG} {...(onComplete !== undefined ? { onComplete } : {})} />
}
