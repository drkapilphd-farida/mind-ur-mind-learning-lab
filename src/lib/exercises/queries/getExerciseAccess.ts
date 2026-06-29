import type { LabId } from '../types'
import type { ExerciseSequenceItem } from '../sequence'
import { getModuleProgress } from './getModuleProgress'

export type ExerciseAccess = { allowed: true } | { allowed: false; nextExercise: ExerciseSequenceItem | null }

// The one place locking is enforced for real — every exercise route in every
// Lab calls this before rendering. The landing page also reads availability
// for display, but only this check actually blocks a locked exercise from
// starting if someone navigates straight to its URL.
export async function getExerciseAccess(
  labId: LabId,
  sequence: readonly ExerciseSequenceItem[],
  exerciseId: string,
): Promise<ExerciseAccess> {
  const orderedExerciseIds = sequence.map((item) => item.exerciseId)
  const progress = await getModuleProgress(labId, orderedExerciseIds)

  if (progress.availabilityByExerciseId[exerciseId] === 'locked') {
    const nextExercise = sequence.find((item) => item.exerciseId === progress.nextRecommendedExerciseId) ?? null
    return { allowed: false, nextExercise }
  }

  return { allowed: true }
}
