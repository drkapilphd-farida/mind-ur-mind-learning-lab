import type { ReadingExerciseQueueItem } from './ReadingExerciseQueueItem'

export type ReadingExerciseQueue = {
  readonly items: readonly ReadingExerciseQueueItem[]
  readonly currentItem: ReadingExerciseQueueItem | null
  readonly remainingCount: number
}
