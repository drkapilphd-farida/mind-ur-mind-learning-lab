'use client'

import { BrainGymDrillExperience } from './BrainGymDrillExperience'
import { useCurriculumSessionCompletion } from '@/features/thirty-day-curriculum/useCurriculumSessionCompletion'
import { SACCADIC_EYE_JUMP_CONFIG } from '../configs/saccadicEyeJumpConfig'

type SaccadicEyeJumpExperienceProps = {
  onComplete?: () => void
  onExit?: () => void
}

export function SaccadicEyeJumpExperience({ onComplete, onExit }: SaccadicEyeJumpExperienceProps = {}): React.JSX.Element {
  const curriculumSession = useCurriculumSessionCompletion('saccadic-eye-jump', '/labs/quantum-speed-reading')
  return <BrainGymDrillExperience
      config={SACCADIC_EYE_JUMP_CONFIG}
      {...(curriculumSession.isActiveStep ? { onComplete: curriculumSession.advance } : onComplete !== undefined ? { onComplete } : {})}
      {...(onExit !== undefined ? { onExit } : {})}
    />
}
