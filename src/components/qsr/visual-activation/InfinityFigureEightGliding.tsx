'use client'

import { Infinity } from 'lucide-react'
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder'
import type { VisualActivationExerciseProps } from './types'

// Exercise 3 of 7 — Infinity Figure-8 Gliding™. Not yet built; this stub
// exists so the suite's modular structure is fully scaffolded for the
// next build pass, matching VisualActivationExerciseProps exactly so
// it's a drop-in swap for its real implementation later.
export function InfinityFigureEightGliding({ onExit }: VisualActivationExerciseProps): React.JSX.Element {
  return (
    <ComingSoonPlaceholder
      title="Infinity Figure-8 Gliding"
      summary="A smooth figure-8 tracking path that trains both eyes to move together as one."
      trains="Binocular coordination"
      icon={Infinity}
      onExit={onExit}
    />
  )
}
