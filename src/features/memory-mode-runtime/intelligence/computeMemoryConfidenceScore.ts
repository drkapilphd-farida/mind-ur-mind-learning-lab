import type { MemorySessionTracking } from './types/MemorySessionTracking'

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™. Pure,
// deterministic, disclosed heuristic — not a validated psychometric
// measure. Weighted from three real runtime signals already computed by
// `computeMemorySessionTracking`: completion (50%, the most direct real
// signal of progress), low revisits (30%, fewer real revisits suggests
// concepts are landing the first time), low repeats (20%, fewer real
// repeat-view chunks suggests less real friction). Weights are a
// deliberate, disclosed design choice, not derived from any external
// data — the same honesty this codebase applies to its other heuristics
// (e.g. `estimatedTimeLeftSeconds`, Sepia theme contrast). Clamped to
// [0, 1] since `repeatRate` has no natural upper bound.
const COMPLETION_WEIGHT = 0.5
const REVISIT_WEIGHT = 0.3
const REPEAT_WEIGHT = 0.2

export function computeMemoryConfidenceScore(tracking: MemorySessionTracking): number {
  const revisitPenalty = Math.min(1, tracking.revisitRate)
  const repeatPenalty = Math.min(1, tracking.repeatRate)

  const score = tracking.completionRate * COMPLETION_WEIGHT + (1 - revisitPenalty) * REVISIT_WEIGHT + (1 - repeatPenalty) * REPEAT_WEIGHT

  return Math.max(0, Math.min(1, score))
}
