'use client'

import { Sparkles } from 'lucide-react'
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder'
import type { VisualActivationExerciseProps } from './types'

// Exercise 5 of 7 — Quantum Tachistoscope Multi-Word Blast™. Not yet
// built; this stub exists so the suite's modular structure is fully
// scaffolded for the next build pass, matching VisualActivationExerciseProps
// exactly so it's a drop-in swap for its real implementation later.
export function QuantumTachistoscopeMultiWordBlast({ onExit }: VisualActivationExerciseProps): React.JSX.Element {
  return (
    <ComingSoonPlaceholder
      title="Quantum Tachistoscope Multi-Word Blast"
      summary="Rapid multi-word flashes that train your eyes to take in whole chunks at once."
      trains="Multi-word chunking"
      icon={Sparkles}
      onExit={onExit}
    />
  )
}
