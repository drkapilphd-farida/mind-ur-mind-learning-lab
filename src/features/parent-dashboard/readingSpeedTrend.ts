import type { DailyQuantumSessionRecord } from '@/app/unified-quantum-session-preview/actions/getDailyQuantumSessionHistory'

export type ReadingSpeedWindowDays = 7 | 14 | 30

export type ReadingSpeedTrendPoint = {
  dateKey: string
  label: string
  wpm: number
}

function toDateKey(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10)
}

// Pure — the 7/14/30-day toggle re-slices already-fetched history
// client-side (see ReadingSpeedTrendCard.tsx) rather than a fresh
// server round-trip per click. One session's WPM per day (the day's
// most recent, since `sessions` is most-recent-first); a day with no
// session simply has no point, rather than a fabricated zero.
export function buildReadingSpeedTrendPoints(sessions: readonly DailyQuantumSessionRecord[], windowDays: ReadingSpeedWindowDays, referenceDate: Date = new Date()): ReadingSpeedTrendPoint[] {
  const cutoff = new Date(referenceDate)
  cutoff.setDate(cutoff.getDate() - windowDays)

  const wpmByDateKey = new Map<string, number>()
  for (const session of sessions) {
    if (new Date(session.occurredAt) < cutoff) continue
    const dateKey = toDateKey(session.occurredAt)
    // sessions is most-recent-first, so the first time a date is seen
    // is already that day's most recent session.
    if (!wpmByDateKey.has(dateKey)) {
      wpmByDateKey.set(dateKey, session.readingWpm)
    }
  }

  return Array.from(wpmByDateKey.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, wpm]) => ({
      dateKey,
      label: new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      wpm,
    }))
}

export function computeAverageWpm(points: readonly ReadingSpeedTrendPoint[]): number | null {
  if (points.length === 0) return null
  return Math.round(points.reduce((sum, point) => sum + point.wpm, 0) / points.length)
}
