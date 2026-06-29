import type { ModuleProgress } from './queries/getModuleProgress'
import type { DailyStreak, TodaysProgress } from './practiceHistory'
import type { ExerciseSequenceItem } from './sequence'

// Pure, generic framing on top of data every Lab already produces — no DB
// access, no Lab-specific assumptions. Takes a moduleTitle so the same
// function works for any future Lab's dashboard summary.

export function getMotivationalMessage(
  progress: ModuleProgress,
  streak: DailyStreak,
  moduleTitle: string,
): string {
  if (progress.completedCount === 0) {
    return "Ready to start your first exercise?"
  }

  if (progress.totalCount > 0 && progress.completedCount === progress.totalCount) {
    return `You've completed every exercise in the ${moduleTitle} — great work!`
  }

  if (streak.currentStreak >= 3) {
    return `You're on a ${streak.currentStreak}-day streak — keep the momentum going!`
  }

  const percent = progress.totalCount > 0 ? Math.round((progress.completedCount / progress.totalCount) * 100) : 0
  return `You're ${percent}% through the ${moduleTitle}.`
}

export function getTodaysGoal(
  progress: ModuleProgress,
  streak: DailyStreak,
  todaysProgress: TodaysProgress,
  currentExercise: ExerciseSequenceItem | null,
): string {
  if (progress.totalCount > 0 && progress.completedCount === progress.totalCount) {
    return "You've finished this module — feel free to revisit any exercise."
  }

  if (todaysProgress.exercisesCompletedToday > 0) {
    return streak.currentStreak > 0
      ? `You've already practiced today — your ${streak.currentStreak}-day streak is safe.`
      : "You've already practiced today. Nice work."
  }

  if (currentExercise !== null) {
    return streak.currentStreak > 0
      ? `Complete ${currentExercise.title} today to extend your ${streak.currentStreak}-day streak.`
      : `Complete ${currentExercise.title} today to start a streak.`
  }

  return 'Practice for a few minutes today to keep your skills sharp.'
}
