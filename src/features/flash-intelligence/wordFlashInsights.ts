// Word Flash™ Insights — the extra, real-data-derived figures the
// redesigned Mission Complete screen shows (Mastery %, Reading Readiness,
// Personal Best, Weekly Progress, Today's Improvement). Pure functions
// over WordFlashSessionEntry history and the existing DifficultyTier rank
// — no new storage, no new adaptive logic, no invented numbers. This is a
// presentation-layer insights module, deliberately kept separate from
// wordFlashEngine.ts (which builds session content) so it's unambiguous
// this doesn't touch item generation or the Flash Engine's timing logic.

import type { DifficultyTier } from '@/types/exercise-engine'
import { difficultyRank, DIFFICULTY_TIERS } from '@/lib/exercise-engine/difficultyEngine'
import type { WordFlashSessionEntry } from './wordFlashHistory'

const MAX_DIFFICULTY_RANK = DIFFICULTY_TIERS.length - 1 // 6 (master)

// Mastery % — blends tier progress (40%, how far up the ladder) with
// accuracy consistency (60%, how reliably correct) into one calm, bounded
// figure. Deliberately not "how you compare to anyone else" — only ever
// derived from this student's own tier and accuracy.
export function computeMasteryPercent(tier: DifficultyTier, averageAccuracyPercent: number): number {
  const tierProgress = (difficultyRank(tier) / MAX_DIFFICULTY_RANK) * 40
  const accuracyComponent = Math.max(0, Math.min(100, averageAccuracyPercent)) * 0.6
  return Math.round(Math.max(0, Math.min(100, tierProgress + accuracyComponent)))
}

// Reading Readiness — a plain-language readout of whether this session's
// accuracy cleared the real threshold the adaptive engine uses to promote
// to the next level (requiredAccuracyToAdvance) — not a separate
// invented signal, just that same real number in words.
export function computeReadingReadiness(
  accuracyPercent: number,
  requiredAccuracyToAdvance: number,
): 'Ready to Advance' | 'Building Consistency' {
  return accuracyPercent >= requiredAccuracyToAdvance ? 'Ready to Advance' : 'Building Consistency'
}

// Personal Best — the fastest Estimated Session WPM ever recorded,
// including the just-completed session (callers pass history that already
// includes it). Returns null when there's no history yet.
export function computePersonalBestWpm(history: readonly WordFlashSessionEntry[]): number | null {
  if (history.length === 0) return null
  return Math.max(...history.map((entry) => entry.estimatedWpm))
}

function isSameCalendarDay(a: number, b: number): boolean {
  const dateA = new Date(a)
  const dateB = new Date(b)
  return dateA.getFullYear() === dateB.getFullYear()
    && dateA.getMonth() === dateB.getMonth()
    && dateA.getDate() === dateB.getDate()
}

// Weekly Progress — how many missions were completed in the last 7 days
// (rolling window from `now`, not calendar-week-aligned — simpler and
// still an honest, real count).
export function computeWeeklyMissionCount(history: readonly WordFlashSessionEntry[], now: number = Date.now()): number {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  return history.filter((entry) => now - entry.timestamp <= sevenDaysMs).length
}

// Today's Improvement — the change in Estimated Session WPM between the
// first mission played today (from history so far) and the just-completed
// session's own figure, passed in directly rather than re-read from
// storage. This shape is deliberate: the caller has this session's real
// result in hand before it's persisted (see WordFlashExperience's
// computeExtraStats, a pure render-time function), so this never needs a
// fresh, possibly-stale-or-ahead-of-the-write localStorage read. Returns
// null when there's no earlier session today to compare against — the
// caller must render that as "first mission today," never a fabricated
// number.
export function computeTodaysImprovement(
  historySoFar: readonly WordFlashSessionEntry[],
  currentSessionEstimatedWpm: number,
  now: number = Date.now(),
): number | null {
  const todaysEarlierSessions = historySoFar.filter((entry) => isSameCalendarDay(entry.timestamp, now))
  if (todaysEarlierSessions.length === 0) return null
  const first = todaysEarlierSessions[0]!
  return currentSessionEstimatedWpm - first.estimatedWpm
}
