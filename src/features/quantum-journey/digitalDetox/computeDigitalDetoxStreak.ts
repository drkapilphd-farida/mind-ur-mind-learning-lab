// Digital Detox Check-in™ — own-copy convention (mirrors
// dailyQuantumSessionTracking.ts's own computeDailyQuantumStreak exactly:
// same UTC-day-key bucketing, same "alive through today even if today's
// check-in hasn't happened yet" semantics), rather than importing across
// feature folders — this table's own shape (a boolean answer, not a
// reading result) doesn't match that module's DailyQuantumSessionRecord.
// A day only counts toward the streak if at least one real check-in that
// day answered `true` — a `false` answer (or no check-in at all) breaks
// it, same as a missed day breaks the reading streak.

export type DigitalDetoxCheckinRecord = {
  keptPhoneAway: boolean
  occurredAt: string
}

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

export function computeDigitalDetoxStreak(
  checkins: readonly DigitalDetoxCheckinRecord[],
  referenceDateKey: string = todayDateKey(),
): number {
  const successDateKeys = new Set(
    checkins.filter((checkin) => checkin.keptPhoneAway).map((checkin) => toDateKey(checkin.occurredAt)),
  )
  if (successDateKeys.size === 0) return 0

  let streak = 0
  let cursor = successDateKeys.has(referenceDateKey) ? referenceDateKey : dateKeyOffset(referenceDateKey, -1)
  while (successDateKeys.has(cursor)) {
    streak += 1
    cursor = dateKeyOffset(cursor, -1)
  }
  return streak
}
