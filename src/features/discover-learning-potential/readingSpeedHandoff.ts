// Discover Your Learning Potential™ — Reading Speed Handoff.
//
// Memory Discovery™ Sprint-2.1 FIX-03 — "Memory Discovery already
// follows Reading Discovery. Use Reading Discovery results when
// available... If Reading Discovery data is unavailable, use the
// default timing table." Reading Discovery's own real Effective Reading
// Speed (`computeEffectiveReadingPerformance`) is computed entirely
// client-side and never persisted as a queryable field — this is the
// one small, additive, cross-experience bridge: Reading Discovery writes
// its own real final WPM here once, Memory Discovery reads it back
// (gracefully, `null` if absent) to adjust observation timing. Same
// localStorage-with-safe-fallback shape Memory Discovery's own
// `recentContentHistory.ts` already established — pure I/O, no feature
// logic lives here.

const READING_SPEED_KEY = 'discover-learning-potential-last-reading-wpm'
// A stale reading speed (a very old visit) is a weaker real signal than
// a fresh one — this session-shape mirrors `recentContentHistory.ts`'s
// own bounded-recency discipline rather than trusting a value forever.
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

type ReadingSpeedRecord = { wpm: number; timestamp: number }

export function recordLastReadingSpeed(wpm: number): void {
  if (typeof window === 'undefined') return
  try {
    const record: ReadingSpeedRecord = { wpm, timestamp: Date.now() }
    localStorage.setItem(READING_SPEED_KEY, JSON.stringify(record))
  } catch {
    // storage full or blocked — fail silently, Memory Discovery just
    // falls back to its own default timing table.
  }
}

export function getLastReadingSpeed(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(READING_SPEED_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Partial<ReadingSpeedRecord>).wpm !== 'number' ||
      typeof (parsed as Partial<ReadingSpeedRecord>).timestamp !== 'number'
    ) {
      return null
    }
    const record = parsed as ReadingSpeedRecord
    if (Date.now() - record.timestamp > MAX_AGE_MS) return null
    return record.wpm
  } catch {
    return null
  }
}
