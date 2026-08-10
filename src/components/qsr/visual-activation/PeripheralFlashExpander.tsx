'use client'

import { Zap } from 'lucide-react'
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder'
import type { VisualActivationExerciseProps } from './types'

// Exercise 4 of 7 — Peripheral Flash Expander™. Not yet built; this stub
// exists so the suite's modular structure is fully scaffolded for the
// next build pass, matching VisualActivationExerciseProps exactly so
// it's a drop-in swap for its real implementation later.
export function PeripheralFlashExpander({ onExit }: VisualActivationExerciseProps): React.JSX.Element {
  return (
    <ComingSoonPlaceholder
      title="Peripheral Flash Expander"
      summary="Extreme-corner flashes that stretch your usable visual field outward."
      trains="Eye span expansion"
      icon={Zap}
      onExit={onExit}
    />
  )
}
