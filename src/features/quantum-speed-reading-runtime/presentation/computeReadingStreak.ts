// Quantum Speed Reading Hub Experience™ (Sprint-1) — Current Streak.
// Pure, deterministic — counts real consecutive calendar days (most
// recent first) with at least one real completion timestamp, across
// every document (a reading streak spans whatever material a learner is
// reading, not one chapter). `now` is injectable for real, deterministic
// tests — never `Math.random()`, never a guessed number when there are
// zero real timestamps (returns 0 honestly).
export function computeReadingStreak(recordedAtTimestamps: readonly string[], now: Date = new Date()): number {
  if (recordedAtTimestamps.length === 0) return 0

  const realDays = new Set(recordedAtTimestamps.map((iso) => toCalendarDayKey(new Date(iso))))

  let streak = 0
  const cursor = new Date(now)
  cursor.setHours(0, 0, 0, 0)

  while (realDays.has(toCalendarDayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function toCalendarDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}
