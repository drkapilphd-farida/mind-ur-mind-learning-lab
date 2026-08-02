// Personal Bests — Sprint 4. Simple max/min comparisons over real session
// history — no reusable "is this a new best" helper existed anywhere in
// this codebase (confirmed), so these are written fresh, matching the
// `Math.max(prev, next)` idiom already used in sessionEngine.ts.

import { computeDailyStreak } from '@/lib/exercises/practiceHistory'
import type { ReadingSessionRecord, PersonalBests } from './readingIntelligenceTypes'

function dateKey(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10)
}

export function computePersonalBests(sessions: readonly ReadingSessionRecord[]): PersonalBests {
  const completed = sessions.filter((s) => s.completed)

  if (completed.length === 0) {
    return {
      highestWpm: null,
      highestReadingScore: null,
      bestAccuracy: null,
      bestComprehension: null,
      fastestSessionMs: null,
      longestStreak: 0,
      bestReadingDay: null,
    }
  }

  const streakInput = completed.map((s) => ({
    exerciseId: s.passageId,
    durationMs: s.readingTimeMs,
    completed: s.completed,
    occurredAt: s.occurredAt,
  }))
  const streak = computeDailyStreak(streakInput)

  const sessionsPerDay = new Map<string, number>()
  for (const session of completed) {
    const key = dateKey(session.occurredAt)
    sessionsPerDay.set(key, (sessionsPerDay.get(key) ?? 0) + 1)
  }
  let bestReadingDay: PersonalBests['bestReadingDay'] = null
  for (const [key, count] of sessionsPerDay) {
    if (!bestReadingDay || count > bestReadingDay.sessionCount) {
      bestReadingDay = { dateKey: key, sessionCount: count }
    }
  }

  return {
    highestWpm: Math.max(...completed.map((s) => s.wpm)),
    highestReadingScore: Math.max(...completed.map((s) => s.readingIntelligenceScore)),
    bestAccuracy: Math.max(...completed.map((s) => s.accuracyPercent)),
    bestComprehension: Math.max(...completed.map((s) => s.comprehensionPercent)),
    fastestSessionMs: Math.min(...completed.map((s) => s.readingTimeMs)),
    longestStreak: streak.bestStreak,
    bestReadingDay,
  }
}
