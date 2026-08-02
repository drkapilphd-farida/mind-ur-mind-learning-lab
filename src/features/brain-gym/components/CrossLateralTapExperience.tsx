'use client'

import { BrainGymDrillExperience } from './BrainGymDrillExperience'
import { CROSS_LATERAL_TAP_CONFIG } from '../configs/crossLateralTapConfig'

type CrossLateralTapExperienceProps = {
  onComplete?: () => void
}

export function CrossLateralTapExperience({ onComplete }: CrossLateralTapExperienceProps = {}): React.JSX.Element {
  return <BrainGymDrillExperience config={CROSS_LATERAL_TAP_CONFIG} {...(onComplete !== undefined ? { onComplete } : {})} />
}
