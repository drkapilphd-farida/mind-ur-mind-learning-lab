import type { FixationExerciseType, FixationSessionRecord } from '../fixationTypes'
import { computeFixationStreak } from '../fixationStreak'
import { computeFocusScore, getHighestDifficultyRatio } from '../focusScore'

export type FixationStats = {
  completedSessionCount: number
  currentStreak: number
  bestStreak: number
  totalDurationSeconds: number
  mostPracticedExerciseType: FixationExerciseType | null
  focusScore: number
}

// Pure transform over already-fetched rows (from getFixationSessions) — no
// DB access here, so every consumer computes stats once from a single fetch
// instead of re-querying per widget, mirroring practiceHistory.ts's role.
// "Update Visual Intelligence progress" is satisfied by always deriving
// these numbers live from the real session log, never a separately cached
// counter that could drift from reality.
export function getFixationStats(sessions: readonly FixationSessionRecord[]): FixationStats {
  const completedSessions = sessions.filter((session) => session.completed)
  const completedSessionCount = completedSessions.length
  const totalDurationSeconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0)

  const { currentStreak, bestStreak } = computeFixationStreak(sessions)

  const countByType = new Map<FixationExerciseType, number>()
  for (const session of completedSessions) {
    countByType.set(session.exerciseType, (countByType.get(session.exerciseType) ?? 0) + 1)
  }
  let mostPracticedExerciseType: FixationExerciseType | null = null
  let highestCount = 0
  for (const [exerciseType, count] of countByType) {
    if (count > highestCount) {
      highestCount = count
      mostPracticedExerciseType = exerciseType
    }
  }

  const highestDifficultyRatio = getHighestDifficultyRatio(completedSessions)
  const focusScore = computeFocusScore({
    completedSessionCount,
    currentStreak,
    highestDifficultyRatio,
    totalDurationSeconds,
  })

  return { completedSessionCount, currentStreak, bestStreak, totalDurationSeconds, mostPracticedExerciseType, focusScore }
}
