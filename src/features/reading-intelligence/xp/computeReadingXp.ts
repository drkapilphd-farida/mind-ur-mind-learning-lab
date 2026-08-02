import type { ReadingXp } from '../types'

const XP_PER_COMPLETED_EXERCISE = 10
const XP_PER_STREAK_DAY = 5

// New, secondary gamification layer (product decision: Mind Score™ remains
// primary). Pure and deterministic — never reads or influences Mind Score,
// journey status, or navigation.
export function computeReadingXp(completedExerciseCount: number, currentStreak: number): ReadingXp {
  const fromCompletedExercises = completedExerciseCount * XP_PER_COMPLETED_EXERCISE
  const fromStreak = currentStreak * XP_PER_STREAK_DAY

  return { totalXp: fromCompletedExercises + fromStreak, fromCompletedExercises, fromStreak }
}
