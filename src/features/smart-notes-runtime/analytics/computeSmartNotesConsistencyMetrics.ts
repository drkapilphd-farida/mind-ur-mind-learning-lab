import type { SessionSnapshot } from '@/core/learning-session-runtime'
import type { SmartNotesConsistencyMetrics } from './types/SmartNotesConsistencyMetrics'

// Smart Notes™ Sprint-4 — Analytics & Insights™. Learning Consistency
// Metrics. Pure (the real clock is injected, never read directly).
// Buckets real sessions by real UTC calendar day — `activeDays` is the
// real count of distinct days with at least one session,
// `longestStreakDays` is the longest real run of consecutive days,
// `currentStreakDays` counts backward from today only if today itself
// had real activity, and `averageSessionsPerActiveDay` is a real,
// honest ratio. Mirrors Memory Mode™'s own
// `computeMemoryConsistencyMetrics` (Sprint-4) exactly.
const ONE_DAY_MS = 24 * 60 * 60 * 1000

function toUTCDateString(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

export function computeSmartNotesConsistencyMetrics(snapshots: readonly SessionSnapshot[], now: () => Date = () => new Date()): SmartNotesConsistencyMetrics {
  if (snapshots.length === 0) {
    return { activeDays: 0, currentStreakDays: 0, longestStreakDays: 0, averageSessionsPerActiveDay: 0 }
  }

  const dayCounts = new Map<string, number>()
  for (const snapshot of snapshots) {
    const day = toUTCDateString(snapshot.capturedAt)
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1)
  }

  const sortedDayTimestamps = [...dayCounts.keys()].sort().map((day) => new Date(`${day}T00:00:00.000Z`).getTime())

  let longestStreakDays = 1
  let runLength = 1
  for (let i = 1; i < sortedDayTimestamps.length; i += 1) {
    const current = sortedDayTimestamps[i]
    const prior = sortedDayTimestamps[i - 1]
    runLength = current !== undefined && prior !== undefined && current - prior === ONE_DAY_MS ? runLength + 1 : 1
    longestStreakDays = Math.max(longestStreakDays, runLength)
  }

  const todayString = toUTCDateString(now().toISOString())
  let currentStreakDays = 0
  if (dayCounts.has(todayString)) {
    let cursorMs = new Date(`${todayString}T00:00:00.000Z`).getTime()
    while (dayCounts.has(new Date(cursorMs).toISOString().slice(0, 10))) {
      currentStreakDays += 1
      cursorMs -= ONE_DAY_MS
    }
  }

  return {
    activeDays: dayCounts.size,
    currentStreakDays,
    longestStreakDays,
    averageSessionsPerActiveDay: snapshots.length / dayCounts.size,
  }
}
