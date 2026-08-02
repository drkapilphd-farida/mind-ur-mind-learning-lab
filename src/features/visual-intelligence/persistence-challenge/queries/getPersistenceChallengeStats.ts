import type { PersistenceChallengeSessionRecord } from '../persistenceChallengeTypes'
import { computePersistenceStreak } from '../persistenceStreak'
import { computePersistenceScore } from '../persistenceScore'

export type PersistenceChallengeStats = {
  completedSessionCount: number
  currentStreak: number
  bestStreak: number
  persistenceScore: number
}

// Pure transform over already-fetched rows (from getPersistenceChallengeSessions)
// — no DB access here, mirrors getFixationStats.ts's role.
export function getPersistenceChallengeStats(sessions: readonly PersistenceChallengeSessionRecord[]): PersistenceChallengeStats {
  const completedSessionCount = sessions.filter((session) => session.completed).length
  const { currentStreak, bestStreak } = computePersistenceStreak(sessions)
  const persistenceScore = computePersistenceScore(completedSessionCount, currentStreak)

  return { completedSessionCount, currentStreak, bestStreak, persistenceScore }
}
