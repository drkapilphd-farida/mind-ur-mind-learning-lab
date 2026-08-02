// Visual Intelligence Lab™ — Visual DNA™, Sprint 8.
// Visual Intelligence Score history — Current/Previous/Growth%/Weekly/
// Monthly Improvement, all recomputed from real session rows (never a
// fabricated trend line). Reuses Sprint-5/6/7's own exported pure
// functions read-only (computeFocusScore, getHighestDifficultyRatio,
// computePersistenceScore, computeVisualIntelligenceScore) — none modified.

import { computeFocusScore, getHighestDifficultyRatio } from '../fixation/focusScore'
import { computePersistenceScore } from '../persistence-challenge/persistenceScore'
import { computeVisualIntelligenceScore } from '../visualIntelligenceScore'
import type { FixationSessionRecord } from '../fixation/fixationTypes'
import type { PersistenceChallengeSessionRecord } from '../persistence-challenge/persistenceChallengeTypes'
import type { ScoreProgress } from './dnaTypes'

function toDateKey(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10)
}

function dateKeyOffset(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10)
}

// A local copy of the day-gap-reset streak algorithm, scoped to Sprint-8's
// own need to recompute streaks over arbitrary (filtered/historical)
// session subsets — same "copy the logic, not a cross-sprint import"
// precedent as fixationStreak.ts/persistenceStreak.ts/adaptiveStats.ts.
export function computeStreakFromSessions(
  sessions: readonly { occurredAt: string; completed: boolean }[],
  referenceDateKey: string = todayDateKey(),
): number {
  const dateKeys = Array.from(new Set(sessions.filter((s) => s.completed).map((s) => toDateKey(s.occurredAt)))).sort()
  if (dateKeys.length === 0) return 0
  const set = new Set(dateKeys)
  let streak = 0
  let cursor = set.has(referenceDateKey) ? referenceDateKey : dateKeyOffset(referenceDateKey, -1)
  while (set.has(cursor)) {
    streak += 1
    cursor = dateKeyOffset(cursor, -1)
  }
  return streak
}

// Visual Intelligence Score™ — the lab-wide aggregate, finally fed by both
// active dimensions this lab has (Sprint-5's Focus Score, Sprint-6's
// Persistence Score). A dimension is included only when the learner has
// real completed sessions for it — same "average of ACTIVE dimensions
// only" honesty precedent as computeMindScore/computeVisualIntelligenceScore
// themselves already document.
export function computeVisualIntelligenceScoreFromRawSessions(
  fixation: readonly FixationSessionRecord[],
  persistenceChallenge: readonly PersistenceChallengeSessionRecord[],
): number {
  const fixationCompleted = fixation.filter((s) => s.completed)
  const persistenceCompleted = persistenceChallenge.filter((s) => s.completed)
  const activeDimensionScores: number[] = []

  if (fixationCompleted.length > 0) {
    activeDimensionScores.push(
      computeFocusScore({
        completedSessionCount: fixationCompleted.length,
        currentStreak: computeStreakFromSessions(fixation),
        highestDifficultyRatio: getHighestDifficultyRatio(fixationCompleted),
        totalDurationSeconds: fixationCompleted.reduce((sum, s) => sum + s.durationSeconds, 0),
      }),
    )
  }

  if (persistenceCompleted.length > 0) {
    activeDimensionScores.push(computePersistenceScore(persistenceCompleted.length, computeStreakFromSessions(persistenceChallenge)))
  }

  return computeVisualIntelligenceScore(activeDimensionScores)
}

function computeHistoricalImprovement(
  fixation: readonly FixationSessionRecord[],
  persistenceChallenge: readonly PersistenceChallengeSessionRecord[],
  daysAgo: number,
  currentScore: number,
): number | null {
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - daysAgo)
  const cutoffIso = cutoff.toISOString()

  const fixationBefore = fixation.filter((s) => s.occurredAt < cutoffIso)
  const persistenceBefore = persistenceChallenge.filter((s) => s.occurredAt < cutoffIso)

  const hasAnyBefore = fixationBefore.some((s) => s.completed) || persistenceBefore.some((s) => s.completed)
  if (!hasAnyBefore) return null // all activity happened within this window — no honest baseline to compare against

  const scoreBefore = computeVisualIntelligenceScoreFromRawSessions(fixationBefore, persistenceBefore)
  if (scoreBefore === 0) return null

  return Math.round(((currentScore - scoreBefore) / scoreBefore) * 100)
}

export function computeScoreProgress(
  fixation: readonly FixationSessionRecord[],
  persistenceChallenge: readonly PersistenceChallengeSessionRecord[],
): ScoreProgress {
  const currentScore = computeVisualIntelligenceScoreFromRawSessions(fixation, persistenceChallenge)

  const allCompleted = [...fixation, ...persistenceChallenge].filter((s) => s.completed)

  let previousScore: number | null = null
  if (allCompleted.length >= 2) {
    const sortedDesc = [...allCompleted].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    const mostRecent = sortedDesc[0]!
    const isFixationRow = (row: typeof mostRecent): row is FixationSessionRecord => 'exerciseType' in row

    const fixationWithoutMostRecent = isFixationRow(mostRecent) ? fixation.filter((s) => s !== mostRecent) : fixation
    const persistenceWithoutMostRecent = !isFixationRow(mostRecent)
      ? persistenceChallenge.filter((s) => s !== mostRecent)
      : persistenceChallenge

    previousScore = computeVisualIntelligenceScoreFromRawSessions(fixationWithoutMostRecent, persistenceWithoutMostRecent)
  }

  const growthPercent = previousScore !== null && previousScore > 0 ? Math.round(((currentScore - previousScore) / previousScore) * 100) : null

  const weeklyImprovementPercent = computeHistoricalImprovement(fixation, persistenceChallenge, 7, currentScore)
  const monthlyImprovementPercent = computeHistoricalImprovement(fixation, persistenceChallenge, 30, currentScore)

  return { currentScore, previousScore, growthPercent, weeklyImprovementPercent, monthlyImprovementPercent }
}
