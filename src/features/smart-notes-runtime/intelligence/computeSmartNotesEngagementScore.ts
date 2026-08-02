import type { SmartNotesSessionTracking } from './types/SmartNotesSessionTracking'

// Smart Notes™ Sprint-3 — Adaptive Intelligence™. Pure, deterministic,
// disclosed heuristic — not a validated measure, and never a reading of
// note *content*. Weighted from three real runtime signals: completion
// (50%), low revisits (30%), low repeats (20%) — the exact same weights
// Memory Mode™'s own `computeMemoryConfidenceScore` (Sprint-3) uses,
// renamed "Engagement" since this reflects how thoroughly a learner
// worked through the document, not recall confidence. Clamped to [0, 1]
// since `repeatRate` has no natural upper bound.
const COMPLETION_WEIGHT = 0.5
const REVISIT_WEIGHT = 0.3
const REPEAT_WEIGHT = 0.2

export function computeSmartNotesEngagementScore(tracking: SmartNotesSessionTracking): number {
  const revisitPenalty = Math.min(1, tracking.revisitRate)
  const repeatPenalty = Math.min(1, tracking.repeatRate)

  const score = tracking.completionRate * COMPLETION_WEIGHT + (1 - revisitPenalty) * REVISIT_WEIGHT + (1 - repeatPenalty) * REPEAT_WEIGHT

  return Math.max(0, Math.min(1, score))
}
