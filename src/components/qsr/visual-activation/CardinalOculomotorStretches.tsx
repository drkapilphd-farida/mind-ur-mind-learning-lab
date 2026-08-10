'use client'

import { Eye } from 'lucide-react'
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder'
import type { VisualActivationExerciseProps } from './types'

// Exercise 2 of 7 — Cardinal Oculomotor Stretches™. Not yet built; this
// stub exists so the suite's modular structure is fully scaffolded for
// the next build pass, matching VisualActivationExerciseProps exactly so
// it's a drop-in swap for its real implementation later.
export function CardinalOculomotorStretches({ onExit }: VisualActivationExerciseProps): React.JSX.Element {
  return (
    <ComingSoonPlaceholder
      title="Cardinal Oculomotor Stretches"
      summary="Guided up/down/left/right eye-muscle stretches that build tracking control before fast reading."
      trains="Ocular muscle tracking"
      icon={Eye}
      onExit={onExit}
    />
  )
}
