// Reading Profile — Sprint 4 of Quantum Speed Reading™. Pure functions over
// the full session history; nothing here mutates or persists — the profile
// is recomputed fresh from source-of-truth history every time it's needed.

import { computeDailyStreak } from '@/lib/exercises/practiceHistory'
import type { PassageCategory } from '../passageLibrary'
import type { ReadingSessionRecord, ReadingProfile } from './readingIntelligenceTypes'

function average(values: readonly number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

function categoryAverageAccuracy(sessions: readonly ReadingSessionRecord[]): Map<PassageCategory, number> {
  const byCategory = new Map<PassageCategory, number[]>()
  for (const session of sessions) {
    const existing = byCategory.get(session.category) ?? []
    existing.push(session.accuracyPercent)
    byCategory.set(session.category, existing)
  }
  const result = new Map<PassageCategory, number>()
  for (const [category, values] of byCategory) {
    result.set(category, average(values))
  }
  return result
}

export function computeReadingProfile(sessions: readonly ReadingSessionRecord[]): ReadingProfile {
  const completedSessions = sessions.filter((s) => s.completed)

  if (completedSessions.length === 0) {
    return {
      averageWpm: 0,
      averageAccuracy: 0,
      averageComprehension: 0,
      averageReadingScore: 0,
      bestCategory: null,
      weakestCategory: null,
      currentDifficulty: null,
      sessionsCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalReadingTimeMs: 0,
      lastReadingDate: null,
    }
  }

  // Streak reuses computeDailyStreak (src/lib/exercises/practiceHistory.ts)
  // — fully generic over { completed, occurredAt }, shared core
  // infrastructure rather than another mission's engine.
  const streakInput = completedSessions.map((s) => ({
    exerciseId: s.passageId,
    durationMs: s.readingTimeMs,
    completed: s.completed,
    occurredAt: s.occurredAt,
  }))
  const streak = computeDailyStreak(streakInput)

  const categoryAccuracy = categoryAverageAccuracy(completedSessions)
  let bestCategory: PassageCategory | null = null
  let weakestCategory: PassageCategory | null = null
  let bestScore = -1
  let weakestScore = 101
  for (const [category, accuracy] of categoryAccuracy) {
    if (accuracy > bestScore) {
      bestScore = accuracy
      bestCategory = category
    }
    if (accuracy < weakestScore) {
      weakestScore = accuracy
      weakestCategory = category
    }
  }
  // A single category can't honestly be both "best" and "weakest" —
  // requires at least 2 distinct categories practiced.
  if (categoryAccuracy.size < 2) weakestCategory = null

  let mostRecent: ReadingSessionRecord | null = null
  for (const session of completedSessions) {
    if (!mostRecent || new Date(session.occurredAt) > new Date(mostRecent.occurredAt)) {
      mostRecent = session
    }
  }

  return {
    averageWpm: average(completedSessions.map((s) => s.wpm)),
    averageAccuracy: average(completedSessions.map((s) => s.accuracyPercent)),
    averageComprehension: average(completedSessions.map((s) => s.comprehensionPercent)),
    averageReadingScore: average(completedSessions.map((s) => s.readingIntelligenceScore)),
    bestCategory,
    weakestCategory,
    currentDifficulty: mostRecent?.difficulty ?? null,
    sessionsCompleted: completedSessions.length,
    currentStreak: streak.currentStreak,
    longestStreak: streak.bestStreak,
    totalReadingTimeMs: completedSessions.reduce((sum, s) => sum + s.readingTimeMs, 0),
    lastReadingDate: streak.lastPracticedDateKey,
  }
}
