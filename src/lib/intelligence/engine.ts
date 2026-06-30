// Intelligence Engine Foundation™ — generic computation utilities.
//
// These functions work for every Lab. Adding a new Lab (Memory, Focus, etc.)
// means adding a dimension score formula here — zero other files change.
//
// All functions are pure: no DB access, no side effects. Feed them real data
// from the existing practice_sessions / exercise_progress queries.

import { computeMindScore as computeRawMindScore, getMindScoreLabel, computeWeeklyTrend } from '@/lib/exercises/mindScore'
import type { DayActivity } from '@/lib/exercises/practiceHistory'
import type {
  IntelligenceDimensionType,
  IntelligenceDimension,
  MindScore,
  TransformationStage,
  JourneyState,
  EvolutionState,
  Recommendation,
  RecommendationType,
} from '@/types/intelligence'

// ── Dimension score (0–100) ───────────────────────────────────────────────

// Formula weights per dimension — calibrated per cognitive domain.
// Reading: breadth (exercises done) matters more than pure consistency.
// Future Labs can declare different weights without touching the function.
const DIMENSION_WEIGHTS: Record<IntelligenceDimensionType, { practice: number; streak: number }> = {
  reading:     { practice: 0.60, streak: 0.40 },
  memory:      { practice: 0.55, streak: 0.45 },
  focus:       { practice: 0.50, streak: 0.50 },
  meditation:  { practice: 0.40, streak: 0.60 }, // consistency drives meditation more
  emotional:   { practice: 0.55, streak: 0.45 },
  fitness:     { practice: 0.50, streak: 0.50 },
  'ai-mentor': { practice: 0.70, streak: 0.30 },
}

export function calculateDimensionScore(input: {
  type: IntelligenceDimensionType
  completionPercent: number  // 0–100: exercises done vs total in this Lab
  currentStreak: number
}): number {
  const { type, completionPercent, currentStreak } = input
  const weights = DIMENSION_WEIGHTS[type]
  const practiceComponent = completionPercent * weights.practice
  const streakComponent = Math.min(currentStreak / 14, 1) * 100 * weights.streak
  return Math.min(100, Math.round(practiceComponent + streakComponent))
}

// ── Mind Score (0–1000) ───────────────────────────────────────────────────

// Computes the overall Mind Score from a set of active dimension objects.
// Inactive/locked dimensions are excluded so they don't suppress the score.
export function calculateMindScore(dimensions: IntelligenceDimension[]): MindScore {
  const active = dimensions.filter((d) => d.isActive && d.score > 0)
  const raw = computeRawMindScore(active.map((d) => d.score))
  const meta = getMindScoreLabel(raw)
  return { total: raw, label: meta.label, description: meta.description }
}

// ── Momentum (0–100) ──────────────────────────────────────────────────────

// A single number expressing how much of the student's peak consistency
// they are currently sustaining. Plateaus at 100 when streak == bestStreak.
export function calculateMomentum(
  currentStreak: number,
  bestStreak: number,
): number {
  if (bestStreak === 0) return 0
  return Math.min(100, Math.round((currentStreak / Math.max(bestStreak, 7)) * 100))
}

// ── Transformation stage ──────────────────────────────────────────────────

export function calculateTransformationStage(input: {
  currentStreak: number
  activatedCount: number
  weeklyTrend: number | null
}): TransformationStage {
  const { currentStreak, activatedCount, weeklyTrend } = input
  if (activatedCount === 0) return 'Beginning'
  if (currentStreak === 0) return 'Recovering'
  if (currentStreak >= 3 && weeklyTrend !== null && weeklyTrend > 10) return 'Accelerating'
  if (currentStreak >= 1 || (weeklyTrend !== null && weeklyTrend > 0)) return 'Growing'
  return 'Stable'
}

// ── Journey state ─────────────────────────────────────────────────────────

export function calculateJourneyState(input: {
  currentStreak: number
  bestStreak: number
  weeklyActiveDays: number
  weeklyDays: DayActivity[]
  activatedCount: number
}): JourneyState {
  const { currentStreak, bestStreak, weeklyActiveDays, weeklyDays, activatedCount } = input
  const weeklyTrend = computeWeeklyTrend(weeklyDays)
  const stage = calculateTransformationStage({ currentStreak, activatedCount, weeklyTrend })
  return {
    stage,
    momentumPercent: calculateMomentum(currentStreak, bestStreak),
    consistencyPercent: Math.round((weeklyActiveDays / 7) * 100),
    currentStreak,
    bestStreak,
  }
}

// ── Evolution state ───────────────────────────────────────────────────────

// Maps the ordered sequence of Labs and their Mind Score unlock thresholds.
// When a new Lab ships, add it here — no other file needs to change.
const EVOLUTION_SEQUENCE: Array<{
  dimension: IntelligenceDimensionType
  mindScoreRequired: number | null
}> = [
  { dimension: 'reading',    mindScoreRequired: null  },  // always first
  { dimension: 'memory',     mindScoreRequired: 500   },
  { dimension: 'focus',      mindScoreRequired: 600   },
  { dimension: 'meditation', mindScoreRequired: 700   },
  { dimension: 'emotional',  mindScoreRequired: 800   },
  { dimension: 'fitness',    mindScoreRequired: 900   },
  { dimension: 'ai-mentor',  mindScoreRequired: 950   },
]

export function calculateEvolution(input: {
  currentDimension: IntelligenceDimensionType
  activatedCount: number
  totalCount: number
  mindScore: number
}): EvolutionState {
  const { currentDimension, activatedCount, totalCount, mindScore } = input
  const currentIdx = EVOLUTION_SEQUENCE.findIndex((s) => s.dimension === currentDimension)
  const next = EVOLUTION_SEQUENCE[currentIdx + 1] ?? null
  const isReadyForEvolution = activatedCount >= totalCount && totalCount > 0

  const progressPercent =
    next?.mindScoreRequired !== null && next?.mindScoreRequired !== undefined
      ? Math.min(100, Math.round((mindScore / next.mindScoreRequired) * 100))
      : 100

  return {
    currentDimension,
    nextDimension: next?.dimension ?? null,
    mindScoreRequired: next?.mindScoreRequired ?? null,
    isReadyForEvolution,
    progressPercent,
  }
}

// ── Recommendation ────────────────────────────────────────────────────────

// Produces a deterministic recommendation from real state — no AI call
// needed for the basic recommendation; AI enriches it but isn't required.
export function calculateRecommendation(input: {
  journeyState: JourneyState
  evolutionState: EvolutionState
  nextActionLabel: string | null
  nextActionHref: string | null
}): Recommendation {
  const { journeyState, evolutionState, nextActionLabel, nextActionHref } = input

  let type: RecommendationType = 'practice'
  let message: string
  let detail: string | null = null

  if (journeyState.stage === 'Recovering') {
    type = 'reflect'
    message = 'Your brain retains more than you feel. One session restores your momentum.'
    detail = 'Pick up where you left off — it comes back faster than you expect.'
  } else if (evolutionState.isReadyForEvolution) {
    type = 'evolve'
    message = 'This stage is fully activated. Your mind is ready for the next evolution.'
    detail = evolutionState.nextDimension !== null
      ? `Begin ${evolutionState.nextDimension.replace(/-/g, ' ')} Intelligence — your foundation is strong.`
      : null
  } else if (journeyState.stage === 'Accelerating') {
    type = 'practice'
    message = 'Your momentum is exceptional. Keep it going — this is when real transformation accelerates.'
  } else {
    type = 'practice'
    message = "Consistent daily practice is the only thing that transforms a mind. Today's session matters."
  }

  return {
    type,
    message,
    detail,
    actionLabel: nextActionLabel,
    actionHref: nextActionHref,
    estimatedMinutes: 4,
  }
}

// ── Barrel export of types ────────────────────────────────────────────────
// Re-export from types so consuming files only need one import.
export type {
  IntelligenceDimensionType,
  IntelligenceDimension,
  MindScore,
  TransformationStage,
  JourneyState,
  EvolutionState,
  Recommendation,
  TimelineStage,
  TimelineStageStatus,
  LabDefinition,
  ActivationStatus,
} from '@/types/intelligence'

export { DIMENSION_LABELS, DIMENSION_SHORT_LABELS } from '@/types/intelligence'
