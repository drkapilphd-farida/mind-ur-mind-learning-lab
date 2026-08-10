'use client'

import { Timer } from 'lucide-react'
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder'
import type { VisualActivationExerciseProps } from './types'

// Exercise 7 of 7 — Blink-Trigger Micro-Recall™. Not yet built; this stub
// exists so the suite's modular structure is fully scaffolded for the
// next build pass, matching VisualActivationExerciseProps exactly so
// it's a drop-in swap for its real implementation later.
export function BlinkTriggerMicroRecall({ onExit }: VisualActivationExerciseProps): React.JSX.Element {
  return (
    <ComingSoonPlaceholder
      title="Blink-Trigger Micro-Recall"
      summary="A word appears for a single blink-length instant — then you recall it from memory."
      trains="Rapid visual-to-memory transfer"
      icon={Timer}
      onExit={onExit}
    />
  )
}
