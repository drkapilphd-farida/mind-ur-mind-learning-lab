// Pure transforms over a Daily Quantum Session history — own-copy
// convention (mirrors src/lib/exercises/practiceHistory.ts's
// computeDailyStreak UTC-day-key bucketing logic, rather than importing
// across feature folders, since that module's PracticeSessionRecord shape
// and "completed" semantics don't match this table's own append-only-only-
// on-real-completion rows). Streak and lifetime XP are both computed fresh
// from the log every time — never a separately mutable running total —
// the same convention every other tracking surface in this codebase
// already follows.

import type { DailyQuantumSessionRecord } from '../actions/getDailyQuantumSessionHistory'

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

// The current streak is "alive" through today even if today's session
// hasn't happened yet (last session was yesterday), but resets to 0 the
// moment a full day passes with no completed session at all.
export function computeDailyQuantumStreak(
  sessions: readonly DailyQuantumSessionRecord[],
  referenceDateKey: string = todayDateKey(),
): number {
  const sessionDateKeys = new Set(sessions.map((session) => toDateKey(session.occurredAt)))
  if (sessionDateKeys.size === 0) return 0

  let currentStreak = 0
  let cursor = sessionDateKeys.has(referenceDateKey) ? referenceDateKey : dateKeyOffset(referenceDateKey, -1)
  while (sessionDateKeys.has(cursor)) {
    currentStreak += 1
    cursor = dateKeyOffset(cursor, -1)
  }
  return currentStreak
}

// Daily Streak Reminders & Motivation System™ — whether today itself
// already has a real completed session, distinct from computeDailyQuantumStreak's
// "alive through today" leniency (a streak can be alive with today still
// pending — the reminder banner needs to tell those two states apart).
export function hasCompletedSessionToday(
  sessions: readonly DailyQuantumSessionRecord[],
  referenceDateKey: string = todayDateKey(),
): boolean {
  return sessions.some((session) => toDateKey(session.occurredAt) === referenceDateKey)
}

// The longest consecutive-day run the user has EVER achieved, not just
// their current one — a streak milestone (3/7/14/21 days) earned once
// stays true forever even after a later gap resets the current streak,
// the same "a real achievement, once earned, isn't erased by an
// unrelated later event" principle every other achievement in this app
// already follows. Computed fresh from real session dates every time —
// never a separately persisted/mutable flag.
export function computeLongestStreakEver(sessions: readonly DailyQuantumSessionRecord[]): number {
  const sortedDateKeys = [...new Set(sessions.map((session) => toDateKey(session.occurredAt)))].sort()
  if (sortedDateKeys.length === 0) return 0

  let longest = 1
  let current = 1
  for (let i = 1; i < sortedDateKeys.length; i++) {
    const previousDateKey = sortedDateKeys[i - 1]!
    const dateKey = sortedDateKeys[i]!
    if (dateKeyOffset(previousDateKey, 1) === dateKey) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }
  return longest
}

export function computeLifetimeXp(sessions: readonly DailyQuantumSessionRecord[]): number {
  return sessions.reduce((sum, session) => sum + session.xpEarned, 0)
}

export function computePersonalBestWpm(sessions: readonly DailyQuantumSessionRecord[]): number | null {
  if (sessions.length === 0) return null
  return Math.max(...sessions.map((session) => session.readingWpm))
}
