'use client'

import { BrainGymDrillExperience } from './BrainGymDrillExperience'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { PERIPHERAL_EXPANDING_CIRCLE_CONFIG } from '../configs/peripheralExpandingCircleConfig'

type PeripheralExpandingCircleExperienceProps = {
  onComplete?: () => void
}

export function PeripheralExpandingCircleExperience({ onComplete }: PeripheralExpandingCircleExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('peripheral-expanding-circle', '/labs/quantum-speed-reading')
  return <BrainGymDrillExperience
      config={PERIPHERAL_EXPANDING_CIRCLE_CONFIG}
      {...(curriculumSession.isActiveStep ? { onComplete: curriculumSession.advance } : onComplete !== undefined ? { onComplete } : {})}
    />
}
