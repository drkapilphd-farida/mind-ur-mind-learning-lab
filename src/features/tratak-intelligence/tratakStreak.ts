// Visual Intelligence Lab™ — Tratak Intelligence Journey™, Sprint 10A.
// Mirrors computeFixationStreak's exact day-gap-reset algorithm
// (src/features/visual-intelligence/fixation/fixationStreak.ts) against
// this journey's own session shape — a small local copy, not a shared
// import, same precedent as every other lab's own streak file.

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

export type TratakStreakSession = { occurredAt: string; completed: boolean }

export type TratakStreak = {
  currentStreak: number
  bestStreak: number
  lastPracticedDateKey: string | null
}

export function computeTratakStreak(
  sessions: readonly TratakStreakSession[],
  referenceDateKey: string = todayDateKey(),
): TratakStreak {
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
