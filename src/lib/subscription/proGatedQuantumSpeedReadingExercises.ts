import type { LabId } from '@/lib/exercises/types'
import { EYE_FOUNDATION_MODULE } from '@/features/quantum-speed-reading/eyeFoundationModule'
import { READING_EXPANSION_MODULE } from '@/features/quantum-speed-reading/readingExpansionModule'

// Quantum Speed Reading Paywall™ — exactly the exercises gated at
// render-time in each exercise page.tsx (Reading Preparation™ +
// Core Reading Journey™), named explicitly here rather than "every
// exercise under the quantum-speed-reading labId" — that labId also
// covers Flash Intelligence Pack™ exercises (word-flash, etc.), which
// stay free/unlinked exactly as they already were before this pass, not
// newly paywalled by accident.
const PRO_GATED_EXERCISE_IDS = new Set<string>([
  ...EYE_FOUNDATION_MODULE.map((exercise) => exercise.exerciseId),
  ...READING_EXPANSION_MODULE.map((exercise) => exercise.exerciseId),
])

export function isProGatedQuantumSpeedReadingExercise(labId: LabId, exerciseId: string): boolean {
  return labId === 'quantum-speed-reading' && PRO_GATED_EXERCISE_IDS.has(exerciseId)
}
