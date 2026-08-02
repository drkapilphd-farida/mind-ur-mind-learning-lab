// Mirrors ExerciseAvailability ('completed' | 'current' | 'locked') from
// src/lib/exercises/queries/getModuleProgress.ts exactly — this feature
// never re-derives availability, only relabels an already-computed
// ModuleProgress into a queue-shaped list.
export type ReadingExerciseQueueItemStatus = 'completed' | 'current' | 'locked'

export type ReadingExerciseQueueItem = {
  readonly exerciseId: string
  readonly title: string
  readonly href: string
  readonly status: ReadingExerciseQueueItemStatus
}
