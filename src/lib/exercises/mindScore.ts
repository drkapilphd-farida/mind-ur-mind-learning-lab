// Universal Mind Score™ computation — designed to work across every Lab.
// Pure functions only; no DB access. When future Labs activate (Memory,
// Focus, Meditation), add their real scores to computeMindScore's input
// without changing this file's existing behaviour.

import type { DayActivity } from './practiceHistory'

// ── Per-dimension scores (0–100) ──────────────────────────────────────────

// Reading Intelligence score: weighted blend of how much of the module has
// been practised (breadth) and how consistently the student shows up
// (streak), capped at 100.
export function computeReadingScore(
  completionPercent: number,
  currentStreak: number,
): number {
  const breadth = completionPercent * 0.6
  const consistency = Math.min(currentStreak / 14, 1) * 100 * 0.4
  return Math.min(100, Math.round(breadth + consistency))
}

// Memory Intelligence score: average recall-quiz accuracy across every
// completed AI Document Transformer Quantum Session — a real signal
// (comprehension of uploaded material), distinct from Reading
// Intelligence's exercise-completion breadth. Returns null (never 0)
// when the student hasn't completed one yet — an honest "not yet
// attempted" state, never a fabricated starting score. (Focus's
// equivalent lives in the Visual Fixation Engine's own
// computeFocusScore — src/features/visual-intelligence/fixation/focusScore.ts
// — reused directly rather than duplicated here.)
export function computeMemoryScore(
  documentSessions: readonly { correctAnswersCount: number; totalQuestionsCount: number }[],
): number | null {
  if (documentSessions.length === 0) return null
  const averageAccuracy =
    documentSessions.reduce((sum, session) => sum + (session.correctAnswersCount / session.totalQuestionsCount) * 100, 0) / documentSessions.length
  return Math.round(averageAccuracy)
}

// ── Overall Mind Score™ (0–1000) ─────────────────────────────────────────

// Average of all ACTIVE dimension scores, scaled to 0–1000. Locked/future
// dimensions are excluded — including them at 0 would permanently suppress
// the score, which misrepresents the student's actual progress.
export function computeMindScore(activeDimensionScores: number[]): number {
  if (activeDimensionScores.length === 0) return 0
  const avg = activeDimensionScores.reduce((a, b) => a + b, 0) / activeDimensionScores.length
  return Math.min(1000, Math.round(avg * 10))
}

// ── Score label ───────────────────────────────────────────────────────────

export type MindScoreLabel = {
  label: string
  description: string
}

export function getMindScoreLabel(score: number): MindScoreLabel {
  if (score >= 900) return { label: 'Peak Performance', description: 'Exceptional consistency and mastery' }
  if (score >= 800) return { label: 'Excellent Progress', description: 'Your mind is performing at a high level' }
  if (score >= 600) return { label: 'Strong Progress', description: 'Solid habits are forming' }
  if (score >= 400) return { label: 'Growing Consistently', description: 'Your practice is paying off' }
  if (score >= 200) return { label: 'Building Momentum', description: 'Keep showing up daily' }
  if (score > 0) return { label: 'Just Beginning', description: 'Your transformation starts here' }
  return { label: 'Activate Your Mind', description: 'Complete your first session to begin scoring' }
}

// ── Weekly trend ─────────────────────────────────────────────────────────

// Returns the percentage change in practice time between the first half
// and second half of the 7-day window. Positive = improving, negative =
// declining. Returns null when there is no historical data to compare.
export function computeWeeklyTrend(days: DayActivity[]): number | null {
  if (days.length < 7) return null
  const firstHalf = days.slice(0, 3).reduce((a, d) => a + d.durationMs, 0)
  const secondHalf = days.slice(4).reduce((a, d) => a + d.durationMs, 0)
  if (firstHalf === 0 && secondHalf === 0) return null
  if (firstHalf === 0) return null // no prior data — can't compute change
  return Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
}

// ── Journey status ────────────────────────────────────────────────────────

export type JourneyStatus = 'Beginning' | 'Growing' | 'Accelerating' | 'Stable' | 'Recovering'

export function computeJourneyStatus(
  streak: number,
  completedCount: number,
  weeklyTrend: number | null,
): JourneyStatus {
  if (completedCount === 0) return 'Beginning'
  if (streak === 0 && completedCount > 0) return 'Recovering'
  if (streak >= 3 && weeklyTrend !== null && weeklyTrend > 10) return 'Accelerating'
  if (streak >= 1 || (weeklyTrend !== null && weeklyTrend > 0)) return 'Growing'
  return 'Stable'
}

export type JourneyStatusMeta = {
  label: JourneyStatus
  description: string
  momentumPercent: number   // 0–100, for a visual meter
  consistencyPercent: number
}

export function buildJourneyStatusMeta(
  streak: number,
  bestStreak: number,
  weeklyActiveDays: number,
  completedCount: number,
  weeklyTrend: number | null,
): JourneyStatusMeta {
  const status = computeJourneyStatus(streak, completedCount, weeklyTrend)
  const momentumPercent = bestStreak > 0 ? Math.min(100, Math.round((streak / Math.max(bestStreak, 7)) * 100)) : 0
  const consistencyPercent = Math.round((weeklyActiveDays / 7) * 100)

  const descriptions: Record<JourneyStatus, string> = {
    Beginning: 'Your transformation is ready to begin',
    Growing: 'You are building a strong mind practice',
    Accelerating: 'Exceptional — your progress is accelerating',
    Stable: 'Consistent practice is keeping your mind active',
    Recovering: 'Your mind remembers — pick up where you left off',
  }

  return { label: status, description: descriptions[status], momentumPercent, consistencyPercent }
}

// ── Strength classification ───────────────────────────────────────────────

export type StrengthSummary = {
  greatestStrength: string | null
  needsImprovement: string | null
  fastestGrowing: string | null
  mostConsistent: string | null
}

// With only one active Lab, the summary is honest about what can be
// derived from real data. When future Labs activate, pass their scores here.
export function buildStrengthSummary(
  readingScore: number,
  weeklyTrend: number | null,
  streak: number,
): StrengthSummary {
  const hasData = readingScore > 0 || streak > 0

  return {
    greatestStrength: hasData ? 'Reading Intelligence' : null,
    needsImprovement: null, // Only one active Lab — cannot determine relative weakness
    fastestGrowing: weeklyTrend !== null && weeklyTrend > 0 ? 'Reading Intelligence' : null,
    mostConsistent: streak >= 3 ? 'Reading Intelligence' : null,
  }
}
