// Gamification & XP Sync — pure transforms over a Quantum Document session
// history. Own-copy convention (mirrors
// src/app/unified-quantum-session-preview/components/dailyQuantumSessionTracking.ts's
// own UTC-day-key bucketing, rather than importing across feature
// folders — a deliberate, previously-established pattern in this
// codebase). Streak and lifetime XP are both computed fresh from the log
// every time — never a separately mutable running total that could drift
// out of sync with the real session history.

import type { QuantumDocumentSessionRecord } from './actions/getQuantumDocumentSessionHistory'

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
export function computeQuantumDocumentStreak(
  sessions: readonly QuantumDocumentSessionRecord[],
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

export function computeQuantumDocumentLifetimeXp(sessions: readonly QuantumDocumentSessionRecord[]): number {
  return sessions.reduce((sum, session) => sum + session.xpEarned, 0)
}
