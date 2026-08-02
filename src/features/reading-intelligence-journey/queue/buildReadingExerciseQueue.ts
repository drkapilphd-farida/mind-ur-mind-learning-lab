import type { ExerciseSequenceItem } from '@/lib/exercises/sequence'
import type { ModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import type { ReadingExerciseQueue, ReadingExerciseQueueItem } from '../types'

// Pure — maps each sequence item's status directly from
// progress.availabilityByExerciseId (already computed by
// getModuleProgress/deriveAvailability). Never re-derives availability
// itself; this is a reshape, not a duplicate of that logic.
export function buildReadingExerciseQueue(
  sequence: readonly ExerciseSequenceItem[],
  progress: ModuleProgress,
): ReadingExerciseQueue {
  const items: ReadingExerciseQueueItem[] = sequence.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    title: exercise.title,
    href: exercise.href,
    status: progress.availabilityByExerciseId[exercise.exerciseId] ?? 'locked',
  }))

  const currentItem = items.find((item) => item.status === 'current') ?? null
  const remainingCount = items.filter((item) => item.status !== 'completed').length

  return { items, currentItem, remainingCount }
}
