// New, secondary gamification layer (product decision: Mind Score™ remains
// the primary intelligence metric; XP never influences it, journey status,
// or navigation — it exists only for this Experience Layer). No existing
// Reading Lab XP system exists to reuse, so this is legitimate new logic.
export type ReadingXp = {
  readonly totalXp: number
  readonly fromCompletedExercises: number
  readonly fromStreak: number
}
