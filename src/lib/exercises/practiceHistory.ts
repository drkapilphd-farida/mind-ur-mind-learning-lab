import type { ExerciseSequenceItem } from './sequence'
import type { PracticeSessionRecord } from './queries/getPracticeSessions'

// Pure transforms on top of getPracticeSessions — no DB access, so every
// derived view (streak, today, weekly, timeline, history) is computed once
// from a single fetch instead of being re-queried per widget.

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

export type DailyStreak = {
  currentStreak: number
  bestStreak: number
  lastPracticedDateKey: string | null
}

// A day counts toward the streak only if at least one exercise was
// completed that day — exited-early attempts don't count. Missed-day
// handling: the current streak is "alive" through today even if today
// hasn't happened yet (last practiced yesterday), but resets to 0 the
// moment a full day passes with no practice at all.
export function computeDailyStreak(
  sessions: readonly PracticeSessionRecord[],
  referenceDateKey: string = todayDateKey(),
): DailyStreak {
  const practicedDateKeys = Array.from(
    new Set(sessions.filter((session) => session.completed).map((session) => toDateKey(session.occurredAt))),
  ).sort()

  if (practicedDateKeys.length === 0) {
    return { currentStreak: 0, bestStreak: 0, lastPracticedDateKey: null }
  }

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
  const lastPracticedDateKey = practicedDateKeys[practicedDateKeys.length - 1] ?? null

  let currentStreak = 0
  let cursor = practicedSet.has(referenceDateKey) ? referenceDateKey : dateKeyOffset(referenceDateKey, -1)
  while (practicedSet.has(cursor)) {
    currentStreak += 1
    cursor = dateKeyOffset(cursor, -1)
  }

  return { currentStreak, bestStreak, lastPracticedDateKey }
}

// Brand Logo Warmth™ — real, derived "how many days in a row has this
// user skipped" figure, never a fabricated counter. An active streak
// (currentStreak > 0) always means 0 missed days by definition — the
// streak logic above already resets currentStreak to 0 the moment a full
// day passes with no practice, so a broken streak (currentStreak === 0)
// with a real lastPracticedDateKey is exactly when days have actually
// been missed. A user who has never practiced (lastPracticedDateKey is
// null) shows 0, not a warning — they haven't skipped anything, they
// just haven't started.
export function computeMissedDaysSinceLastPractice(
  { currentStreak, lastPracticedDateKey }: Pick<DailyStreak, 'currentStreak' | 'lastPracticedDateKey'>,
  referenceDateKey: string = todayDateKey(),
): number {
  if (currentStreak > 0 || lastPracticedDateKey === null) return 0

  let missed = 0
  let cursor = dateKeyOffset(lastPracticedDateKey, 1)
  while (cursor <= referenceDateKey) {
    missed += 1
    cursor = dateKeyOffset(cursor, 1)
  }
  return missed
}

export type TodaysProgress = {
  exercisesCompletedToday: number
  totalDurationMsToday: number
}

export function computeTodaysProgress(
  sessions: readonly PracticeSessionRecord[],
  referenceDateKey: string = todayDateKey(),
): TodaysProgress {
  const todaysSessions = sessions.filter((session) => toDateKey(session.occurredAt) === referenceDateKey)
  const completedExerciseIds = new Set(
    todaysSessions.filter((session) => session.completed).map((session) => session.exerciseId),
  )
  const totalDurationMsToday = todaysSessions.reduce((sum, session) => sum + session.durationMs, 0)

  return { exercisesCompletedToday: completedExerciseIds.size, totalDurationMsToday }
}

export type DayActivity = {
  dateKey: string
  label: string
  sessionCount: number
  durationMs: number
}

export function computeWeeklyActivity(
  sessions: readonly PracticeSessionRecord[],
  referenceDateKey: string = todayDateKey(),
): DayActivity[] {
  const byDate = new Map<string, { sessionCount: number; durationMs: number }>()
  for (const session of sessions) {
    const key = toDateKey(session.occurredAt)
    const existing = byDate.get(key) ?? { sessionCount: 0, durationMs: 0 }
    existing.sessionCount += 1
    existing.durationMs += session.durationMs
    byDate.set(key, existing)
  }

  const days: DayActivity[] = []
  for (let offset = 6; offset >= 0; offset--) {
    const dateKey = dateKeyOffset(referenceDateKey, -offset)
    const stats = byDate.get(dateKey) ?? { sessionCount: 0, durationMs: 0 }
    const label = new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    })
    days.push({ dateKey, label, ...stats })
  }

  return days
}

export type TotalPracticeStats = {
  totalCompletedSessions: number
  totalPracticeMs: number
}

// All-time totals, not "today" — totalCompletedSessions counts only
// completed attempts (an exited-early attempt isn't a finished session),
// but totalPracticeMs sums every attempt's duration, since time spent
// practicing is real whether or not the student finished that attempt.
export function computeTotalPracticeStats(sessions: readonly PracticeSessionRecord[]): TotalPracticeStats {
  const totalCompletedSessions = sessions.filter((session) => session.completed).length
  const totalPracticeMs = sessions.reduce((sum, session) => sum + session.durationMs, 0)

  return { totalCompletedSessions, totalPracticeMs }
}

export type SessionHistoryItem = {
  exerciseId: string
  title: string
  occurredAt: string
  durationMs: number
  completed: boolean
}

function withTitles(
  sessions: readonly PracticeSessionRecord[],
  sequence: readonly ExerciseSequenceItem[],
): SessionHistoryItem[] {
  const titleByExerciseId = new Map(sequence.map((item) => [item.exerciseId, item.title]))
  return sessions.map((session) => ({
    exerciseId: session.exerciseId,
    title: titleByExerciseId.get(session.exerciseId) ?? session.exerciseId,
    occurredAt: session.occurredAt,
    durationMs: session.durationMs,
    completed: session.completed,
  }))
}

// `sessions` is assumed most-recent-first (getPracticeSessions' own order).
export function buildSessionHistory(
  sessions: readonly PracticeSessionRecord[],
  sequence: readonly ExerciseSequenceItem[],
  limit = 10,
): SessionHistoryItem[] {
  return withTitles(sessions.slice(0, limit), sequence)
}

export function buildProgressTimeline(
  sessions: readonly PracticeSessionRecord[],
  sequence: readonly ExerciseSequenceItem[],
  limit = 8,
): SessionHistoryItem[] {
  return withTitles(
    sessions.filter((session) => session.completed).slice(0, limit),
    sequence,
  )
}

// For the Continue Learning card: how far into the exercise the student got
// on their most recent incomplete attempt, if any.
export function getLastIncompleteAttemptDuration(
  sessions: readonly PracticeSessionRecord[],
  exerciseId: string,
): number | null {
  const match = sessions.find((session) => session.exerciseId === exerciseId && !session.completed)
  return match?.durationMs ?? null
}

export function formatDurationLabel(durationMs: number): string {
  const totalSeconds = Math.round(durationMs / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`
}
