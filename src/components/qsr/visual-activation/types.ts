import type { LucideIcon } from 'lucide-react'

// Visual Activation Suite™ — the 7 foundational eye-span/neural-
// activation exercises that warm up a learner before Quantum Speed
// Reading. Each exercise's own component takes exactly this shape, so
// the suite orchestrator (VisualActivationSuiteExperience.tsx) can render
// any implemented one interchangeably.
export type VisualActivationExerciseProps = {
  onComplete: () => void
  onExit: () => void
}

export type VisualActivationExerciseId =
  | 'theta-breathing-anchor'
  | 'cardinal-oculomotor-stretches'
  | 'infinity-figure-eight-gliding'
  | 'peripheral-flash-expander'
  | 'quantum-tachistoscope-multi-word-blast'
  | 'aura-edge-color-pulsing'
  | 'blink-trigger-micro-recall'

export type VisualActivationExerciseMeta = {
  id: VisualActivationExerciseId
  order: number
  title: string
  summary: string
  // What this exercise actually trains — shown on its "coming soon" tile
  // so the roadmap reads as real, specific plans, not vague filler.
  trains: string
  icon: LucideIcon
  isImplemented: boolean
}
