'use client'

import { BrainGymDrillExperience } from './BrainGymDrillExperience'
import { SACCADIC_EYE_JUMP_CONFIG } from '../configs/saccadicEyeJumpConfig'

type SaccadicEyeJumpExperienceProps = {
  onComplete?: () => void
}

export function SaccadicEyeJumpExperience({ onComplete }: SaccadicEyeJumpExperienceProps = {}): React.JSX.Element {
  return <BrainGymDrillExperience config={SACCADIC_EYE_JUMP_CONFIG} {...(onComplete !== undefined ? { onComplete } : {})} />
}
