// Visual Intelligence Lab™ — Image Persistence Challenge™, Sprint 6.
// Mirrors computeDailyStreak's exact day-gap-reset algorithm
// (src/lib/exercises/practiceHistory.ts) against this feature's own
// session shape — a small local copy, not a direct import, since that
// function is typed against PracticeSessionRecord/LabId, which this lab
// intentionally doesn't register in. Same approach as Sprint-5's
// fixationStreak.ts.

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

export type PersistenceStreakSession = { occurredAt: string; completed: boolean }

export type PersistenceStreak = {
  currentStreak: number
  bestStreak: number
  lastPracticedDateKey: string | null
}

// A day counts toward the streak only if at least one session was
// completed that day. The current streak is "alive" through today even if
// today hasn't happened yet (last practiced yesterday), but resets to 0 the
// moment a full day passes with no practice at all.
export function computePersistenceStreak(
  sessions: readonly PersistenceStreakSession[],
  referenceDateKey: string = todayDateKey(),
): PersistenceStreak {
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
