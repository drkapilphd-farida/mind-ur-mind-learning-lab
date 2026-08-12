'use client'

import { BrainGymDrillExperience } from './BrainGymDrillExperience'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { CROSS_LATERAL_TAP_CONFIG } from '../configs/crossLateralTapConfig'

type CrossLateralTapExperienceProps = {
  onComplete?: () => void
}

export function CrossLateralTapExperience({ onComplete }: CrossLateralTapExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('cross-lateral-tap', '/labs/quantum-speed-reading')
  return <BrainGymDrillExperience
      config={CROSS_LATERAL_TAP_CONFIG}
      {...(curriculumSession.isActiveStep ? { onComplete: curriculumSession.advance } : onComplete !== undefined ? { onComplete } : {})}
    />
}
