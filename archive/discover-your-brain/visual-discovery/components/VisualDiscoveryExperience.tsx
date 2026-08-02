'use client'

import { useCallback, useState } from 'react'
import { VisualDiscoveryHeader } from './VisualDiscoveryHeader'
import { ObservationStage } from './ObservationStage'
import { ActionBar } from './ActionBar'

type Phase = 'countdown' | 'observing'

// Owns the one piece of state this entry screen has: has the countdown
// finished yet. No assessment logic — that arrives in the next screen.
export function VisualDiscoveryExperience(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('countdown')

  const handleCountdownComplete = useCallback(() => {
    setPhase('observing')
  }, [])

  return (
    <>
      <VisualDiscoveryHeader />
      <ObservationStage phase={phase} onCountdownComplete={handleCountdownComplete} />
      <ActionBar continueEnabled={phase === 'observing'} />
    </>
  )
}
