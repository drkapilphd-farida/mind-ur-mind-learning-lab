// Visual Intelligence Lab™ — Adaptive Visual Intelligence™, Sprint 7.
// Performance Engine — 6 metrics, all 0-100, all real-data-only, mirroring
// focusScore.ts/persistenceScore.ts's "weighted, saturating" style with an
// explicit saturation point disclosed per metric.

import type { PerformanceMetrics, UnifiedVisualStats } from './types/adaptiveTypes'

export function computePerformanceMetrics(stats: UnifiedVisualStats): PerformanceMetrics {
  // Ability to show up without gaps — identical meaning/saturation point
  // (14 days) as every other streak-based score in this codebase, applied
  // lab-wide instead of per-sub-feature.
  const visualStability = 100 * Math.min(1, stats.currentStreak / 14)

  // % of persistence-challenge sessions with a real, voluntary journal
  // entry — the one genuinely optional, therefore informative,
  // reflection-adjacent signal. 0 (not null) here specifically because "no
  // journal usage yet" is itself a real, honest measurement of 0%.
  const observationConsistency = 100 * Math.min(1, stats.observationJournalUsageRate ?? 0)

  // Breadth of Fixation Engine practice specifically, saturating at 20
  // completions — identical saturation point to focusScore.ts's own
  // breadth term.
  const focusGrowth = 100 * Math.min(1, stats.fixationCompletedCount / 20)

  // Lab-wide total completions across all 4 tables, saturating at 30
  // (roughly a month of near-daily single-session practice).
  const trainingFrequency = 100 * Math.min(1, stats.completedSessionCount / 30)

  // Identical formula/saturation to persistenceScore.ts's own breadth term
  // (15 = 3 full cycles through the 5 persistence-challenge images).
  const persistenceLevel = 100 * Math.min(1, stats.persistenceChallengeCompletedCount / 15)

  // A composite "how ready is this learner for the next difficulty tier"
  // signal — deliberately derived FROM the other 5 metrics, not a 6th
  // independent input, so it can never diverge from what they already say.
  const visualReadiness = (visualStability + observationConsistency + focusGrowth + trainingFrequency + persistenceLevel) / 5

  return {
    visualStability: Math.round(visualStability),
    observationConsistency: Math.round(observationConsistency),
    focusGrowth: Math.round(focusGrowth),
    trainingFrequency: Math.round(trainingFrequency),
    persistenceLevel: Math.round(persistenceLevel),
    visualReadiness: Math.round(visualReadiness),
  }
}
