'use client'

import { EyeOff } from 'lucide-react'
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder'
import type { VisualActivationExerciseProps } from './types'

// Exercise 6 of 7 — Aura Edge Color Pulsing™. Not yet built; this stub
// exists so the suite's modular structure is fully scaffolded for the
// next build pass, matching VisualActivationExerciseProps exactly so
// it's a drop-in swap for its real implementation later.
export function AuraEdgeColorPulsing({ onExit }: VisualActivationExerciseProps): React.JSX.Element {
  return (
    <ComingSoonPlaceholder
      title="Aura Edge Color Pulsing"
      summary="Pulsing color cues at the very edge of your vision, trained without ever looking directly at them."
      trains="Side-vision sensitivity"
      icon={EyeOff}
      onExit={onExit}
    />
  )
}
