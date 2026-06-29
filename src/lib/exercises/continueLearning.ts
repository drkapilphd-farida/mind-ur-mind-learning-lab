import type { ModuleProgress } from './queries/getModuleProgress'
import type { ExerciseSequenceItem } from './sequence'

export type ContinueLearningSummary = {
  completedCount: number
  totalCount: number
  isComplete: boolean
  currentExercise: ExerciseSequenceItem | null
  actionLabel: string
  lastCompletedTitle: string | null
  isResuming: boolean
}

// Pure transform on top of getModuleProgress + a Lab's sequence — no DB
// access, so any surface (Lab landing page, main dashboard, a future Lab's
// own page) can call this for identical "what should the student do next"
// wording instead of re-deciding it per page.
export function getContinueLearningSummary(
  progress: ModuleProgress,
  sequence: readonly ExerciseSequenceItem[],
): ContinueLearningSummary {
  const isComplete = progress.totalCount > 0 && progress.completedCount === progress.totalCount
  const currentExercise = sequence.find((item) => item.exerciseId === progress.nextRecommendedExerciseId) ?? null
  const lastCompletedItem = sequence.find((item) => item.exerciseId === progress.lastCompletedExerciseId) ?? null
  const isResuming =
    currentExercise !== null && progress.statusByExerciseId[currentExercise.exerciseId] === 'in-progress'

  const actionLabel =
    currentExercise === null
      ? 'Review'
      : isResuming
        ? `Resume: ${currentExercise.title}`
        : progress.completedCount === 0
          ? `Start: ${currentExercise.title}`
          : `Continue: ${currentExercise.title}`

  return {
    completedCount: progress.completedCount,
    totalCount: progress.totalCount,
    isComplete,
    currentExercise,
    actionLabel,
    lastCompletedTitle: lastCompletedItem?.title ?? null,
    isResuming,
  }
}
