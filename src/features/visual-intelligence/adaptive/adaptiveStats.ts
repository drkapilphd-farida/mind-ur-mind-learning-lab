// Visual Intelligence Lab™ — Adaptive Visual Intelligence™, Sprint 7.
// Pools real rows from all 4 existing session tables into one honest
// UnifiedVisualStats snapshot. No DB access here — pure transform over
// already-fetched rows, mirroring getFixationStats.ts/getPersistenceChallengeStats.ts's role.

import type { FixationSessionRecord } from '../fixation/fixationTypes'
import type { PersistenceChallengeSessionRecord } from '../persistence-challenge/persistenceChallengeTypes'
import type { ImagePersistenceSessionRecord, VisualPreparationSessionRecord } from './types/visualPreparationTypes'
import type { UnifiedVisualStats } from './types/adaptiveTypes'

// XP constants mirror each sprint's own already-disclosed completion-screen
// value exactly (ImagePersistenceCompletion.tsx: 25, FixationCompletion.tsx:
// 20, persistence-challenge CompletionScreen.tsx: 25) — never a new invented
// number. visual_preparation_sessions is deliberately excluded from XP: no
// completion screen was ever shipped for it, so no XP value was ever
// disclosed to any user for it; its sessions still count everywhere else
// (streak, frequency, duration) but not toward totalXp.
const IMAGE_PERSISTENCE_XP_PER_SESSION = 25
const FIXATION_XP_PER_SESSION = 20
const PERSISTENCE_CHALLENGE_XP_PER_SESSION = 25

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

type OccurrenceSession = { occurredAt: string; completed: boolean }

// A 4th local copy of the day-gap-reset streak algorithm (same as
// fixationStreak.ts/persistenceStreak.ts), operating on occurrence
// date-keys merged across all 4 tables — a learner's streak is lab-wide,
// not per-exercise-type.
function computeUnifiedStreak(sessions: readonly OccurrenceSession[]): { currentStreak: number; bestStreak: number } {
  const practicedDateKeys = Array.from(
    new Set(sessions.filter((session) => session.completed).map((session) => toDateKey(session.occurredAt))),
  ).sort()

  if (practicedDateKeys.length === 0) return { currentStreak: 0, bestStreak: 0 }

  let bestStreak = 1
  let runLength = 1
  for (let i = 1; i < practicedDateKeys.length; i++) {
    const previous = practicedDateKeys[i - 1]
    const current = practicedDateKeys[i]
    if (previous !== undefined && current !== undefined && dateKeyOffset(previous, 1) === current) {
      runLength += 1
    } else {
      runLength = 1
    }
    bestStreak = Math.max(bestStreak, runLength)
  }

  const practicedSet = new Set(practicedDateKeys)
  const referenceDateKey = todayDateKey()
  let currentStreak = 0
  let cursor = practicedSet.has(referenceDateKey) ? referenceDateKey : dateKeyOffset(referenceDateKey, -1)
  while (practicedSet.has(cursor)) {
    currentStreak += 1
    cursor = dateKeyOffset(cursor, -1)
  }

  return { currentStreak, bestStreak }
}

export function computeUnifiedVisualStats(sources: {
  imagePersistence: readonly ImagePersistenceSessionRecord[]
  visualPreparation: readonly VisualPreparationSessionRecord[]
  fixation: readonly FixationSessionRecord[]
  persistenceChallenge: readonly PersistenceChallengeSessionRecord[]
}): UnifiedVisualStats {
  const imagePersistenceCompleted = sources.imagePersistence.filter((s) => s.completed)
  const visualPreparationCompleted = sources.visualPreparation.filter((s) => s.completed)
  const fixationCompleted = sources.fixation.filter((s) => s.completed)
  const persistenceChallengeCompleted = sources.persistenceChallenge.filter((s) => s.completed)

  const completedSessionCount =
    imagePersistenceCompleted.length + visualPreparationCompleted.length + fixationCompleted.length + persistenceChallengeCompleted.length

  const totalDurationSeconds =
    imagePersistenceCompleted.reduce((sum, s) => sum + s.durationSeconds, 0) +
    visualPreparationCompleted.reduce((sum, s) => sum + s.durationSeconds, 0) +
    fixationCompleted.reduce((sum, s) => sum + s.durationSeconds, 0) +
    persistenceChallengeCompleted.reduce((sum, s) => sum + s.durationSeconds, 0)

  const avgSessionTimeSeconds = completedSessionCount === 0 ? 0 : totalDurationSeconds / completedSessionCount

  const accuracySamples = fixationCompleted
    .map((s) => s.accuracyPercent)
    .filter((value): value is number => value !== null)
  const successRate = accuracySamples.length === 0 ? null : accuracySamples.reduce((sum, v) => sum + v, 0) / accuracySamples.length

  const journalUsedCount = persistenceChallengeCompleted.filter((s) => s.journalNotes !== null && s.journalNotes.trim().length > 0).length
  const observationJournalUsageRate =
    persistenceChallengeCompleted.length === 0 ? null : journalUsedCount / persistenceChallengeCompleted.length

  const allOccurrences: OccurrenceSession[] = [
    ...sources.imagePersistence,
    ...sources.visualPreparation,
    ...sources.fixation,
    ...sources.persistenceChallenge,
  ]
  const { currentStreak, bestStreak } = computeUnifiedStreak(allOccurrences)

  const totalXp =
    imagePersistenceCompleted.length * IMAGE_PERSISTENCE_XP_PER_SESSION +
    fixationCompleted.length * FIXATION_XP_PER_SESSION +
    persistenceChallengeCompleted.length * PERSISTENCE_CHALLENGE_XP_PER_SESSION

  return {
    completedSessionCount,
    imagePersistenceCompletedCount: imagePersistenceCompleted.length,
    fixationCompletedCount: fixationCompleted.length,
    persistenceChallengeCompletedCount: persistenceChallengeCompleted.length,
    visualPreparationCompletedCount: visualPreparationCompleted.length,
    currentStreak,
    bestStreak,
    totalDurationSeconds,
    avgSessionTimeSeconds,
    successRate,
    observationJournalUsageRate,
    restartCount: 0,
    skippedSessions: 0,
    totalXp,
  }
}
