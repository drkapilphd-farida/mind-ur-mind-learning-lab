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

// Reading Speed score (0-100): average WPM across every completed
// Adaptive Reading Intelligence session, normalized against a 1000 WPM
// ceiling — the same "superhuman reading speed" figure this product's
// own marketing already states, not an arbitrarily chosen number. Null
// (never 0) when the student hasn't completed a single session yet.
export function computeReadingSpeedScore(averageWpm: number, sessionsCompleted: number): number | null {
  if (sessionsCompleted === 0) return null
  return Math.min(100, Math.round(averageWpm / 10))
}

// WPM growth — a real baseline-vs-recent comparison across a student's
// own session history (never a fabricated number): average WPM of their
// earliest completed sessions vs their most recent ones, split into
// rough thirds. Mirrors computeWeeklyTrend's "first half vs second half"
// shape. Returns the actual baseline/current WPM numbers alongside the
// growth % — the Growth Trend chart shows the exact transformation, not
// just a percentage. Needs at least 4 completed sessions to form a
// meaningful baseline/recent split — null before that, not a fake 0%.
export type WpmGrowth = {
  baselineWpm: number
  currentWpm: number
  growthPercent: number
}

export function computeWpmGrowth(sessions: readonly { wpm: number; occurredAt: string; completed: boolean }[]): WpmGrowth | null {
  const completed = sessions
    .filter((s) => s.completed)
    .slice()
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
  if (completed.length < 4) return null

  const splitSize = Math.max(2, Math.floor(completed.length / 3))
  const baseline = completed.slice(0, splitSize)
  const recent = completed.slice(-splitSize)
  const baselineAvg = Math.round(baseline.reduce((sum, s) => sum + s.wpm, 0) / baseline.length)
  const recentAvg = Math.round(recent.reduce((sum, s) => sum + s.wpm, 0) / recent.length)
  if (baselineAvg === 0) return null

  return {
    baselineWpm: baselineAvg,
    currentWpm: recentAvg,
    growthPercent: Math.round(((recentAvg - baselineAvg) / baselineAvg) * 100),
  }
}

// Comprehension Accuracy score (0-100): blends the two real per-session
// signals the Adaptive Reading Intelligence Engine already tracks —
// quiz-based comprehension and word-recognition accuracy. Already a
// percent on both sides, so no normalization needed. Null when no
// sessions exist yet.
export function computeComprehensionAccuracyScore(
  averageAccuracy: number,
  averageComprehension: number,
  sessionsCompleted: number,
): number | null {
  if (sessionsCompleted === 0) return null
  return Math.round((averageAccuracy + averageComprehension) / 2)
}

// Right-Brain Visualization Depth score (0-100): reuses the Visual
// Fixation Engine's own computeFocusScore (breadth + consistency +
// difficulty + duration — src/features/visual-intelligence/fixation/focusScore.ts)
// rather than inventing a parallel formula. computeFocusScore itself
// defaults to 0 breadth on empty input, which would read as a fabricated
// "you're at zero" rather than "not started" — the null-guard lives here,
// same convention as every other dimension on this page.
export function computeVisualizationDepthScore(fixationSessionCount: number, focusScore: number): number | null {
  if (fixationSessionCount === 0) return null
  return focusScore
}

// Consistency & Streak Momentum score (0-100): blends the two real,
// already-computed streak signals from buildJourneyStatusMeta —
// consistencyPercent (active days this week) and momentumPercent
// (current streak vs personal best) — into one combined view. No new
// data source, just a second lens on numbers this page already computes
// for MindJourneyCard. Null when the student has never completed a
// session (0/0 would otherwise read as a real, if bad, score).
export function computeConsistencyMomentumScore(
  consistencyPercent: number,
  momentumPercent: number,
  hasEverPracticed: boolean,
): number | null {
  if (!hasEverPracticed) return null
  return Math.round((consistencyPercent + momentumPercent) / 2)
}

// Neural Retraining Index (0-100): a deliberately small, auditable
// composite of the three most fully server-verified dimensions — Reading
// Speed, Comprehension Accuracy, and Consistency & Streak Momentum.
// Mirrors the 30-Day Curriculum's own computeBrainDevelopmentScore design
// philosophy (curriculumProgress.ts): blend a small set of already-
// computed real scores, not every exercise's own storage — that would be
// fragile coupling for a number nobody could audit. Deliberately excludes
// Visualization Depth and QSR/Holographic Recall (the two partial/self-
// reported signals) from the blend for the same reason. Null until both
// Reading Speed and Comprehension have real data — those two are the
// core "retraining" signal; Consistency alone isn't enough to claim it.
export function computeNeuralRetrainingIndex(
  readingSpeedScore: number | null,
  comprehensionScore: number | null,
  consistencyScore: number | null,
): number | null {
  if (readingSpeedScore === null || comprehensionScore === null) return null
  const consistency = consistencyScore ?? 0
  return Math.round(readingSpeedScore * 0.4 + comprehensionScore * 0.35 + consistency * 0.25)
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

// QSR Pro Circuit™ — a gamified rank name on the exact same 0-1000 Mind
// Score, additive alongside getMindScoreLabel above (never replacing
// it — that function is used in ~10 places today and must not change
// shape). Deliberately reuses the same real, already-computed score
// rather than inventing a second parallel "mastery" number.
export type MindScoreRank = { rank: string; description: string }

export function getMindScoreRank(score: number): MindScoreRank {
  if (score >= 800) return { rank: 'Quantum Master', description: 'Elite mastery across every dimension' }
  if (score >= 400) return { rank: 'Speed Reader', description: 'Consistent, confident real progress' }
  return { rank: 'Novice Reader', description: 'Every rank starts here' }
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

export type DimensionScoreEntry = {
  label: string
  score: number | null // null = not yet attempted, excluded from every comparison below
  trendPercent: number | null // real growth %, null = no trend signal for this dimension
}

// Generic across however many real dimensions are active — compares only
// dimensions with a real score (never treats "not yet attempted" as a
// weakness). Needs at least 2 scored dimensions to name a "needs
// improvement" one (a single dimension can't honestly be relatively
// weak). "Most consistent" stays keyed off the real streak, not a
// dimension score, since streak length is what "consistent" concretely
// means here.
export function buildStrengthSummary(dimensions: readonly DimensionScoreEntry[], streak: number): StrengthSummary {
  const scored = dimensions.filter((d): d is DimensionScoreEntry & { score: number } => d.score !== null)

  if (scored.length === 0) {
    return { greatestStrength: null, needsImprovement: null, fastestGrowing: null, mostConsistent: null }
  }

  const greatest = scored.reduce((best, d) => (d.score > best.score ? d : best))
  const weakest = scored.reduce((worst, d) => (d.score < worst.score ? d : worst))
  const needsImprovement = scored.length >= 2 && weakest.label !== greatest.label ? weakest.label : null

  const growing = scored.filter((d): d is DimensionScoreEntry & { score: number; trendPercent: number } => (d.trendPercent ?? 0) > 0)
  const fastestGrowing =
    growing.length > 0 ? growing.reduce((best, d) => (d.trendPercent > best.trendPercent ? d : best)).label : null

  return {
    greatestStrength: greatest.label,
    needsImprovement,
    fastestGrowing,
    mostConsistent: streak >= 3 ? 'Consistency & Streak Momentum' : null,
  }
}
