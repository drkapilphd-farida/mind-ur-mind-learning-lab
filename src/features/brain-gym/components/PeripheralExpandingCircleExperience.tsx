'use client'

import { BrainGymDrillExperience } from './BrainGymDrillExperience'
import { PERIPHERAL_EXPANDING_CIRCLE_CONFIG } from '../configs/peripheralExpandingCircleConfig'

type PeripheralExpandingCircleExperienceProps = {
  onComplete?: () => void
}

export function PeripheralExpandingCircleExperience({ onComplete }: PeripheralExpandingCircleExperienceProps = {}): React.JSX.Element {
  return <BrainGymDrillExperience config={PERIPHERAL_EXPANDING_CIRCLE_CONFIG} {...(onComplete !== undefined ? { onComplete } : {})} />
}
