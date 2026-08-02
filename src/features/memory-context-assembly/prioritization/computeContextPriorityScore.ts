import type { Memory, MemoryImportance, MemoryLifecycleState } from '@/features/memory-persistence'

// Weights are deliberately hand-picked constants, not learned/scored
// by any model — "No semantic scoring. No AI ranking." Every input
// comes from fields Sprint 13's `Memory` already carries, or from the
// caller-supplied session-relevance flag; nothing here reads memory
// *content*.
const PINNED_WEIGHT = 150

const IMPORTANCE_WEIGHT: Record<MemoryImportance, number> = {
  critical: 40,
  high: 30,
  medium: 20,
  low: 10,
  temporary: 0,
}

const LIFECYCLE_WEIGHT: Record<MemoryLifecycleState, number> = {
  active: 15,
  created: 10,
  archived: 5,
  deleted: 0,
}

const SESSION_RELEVANCE_WEIGHT = 50
const MAX_RECENCY_WEIGHT = 30
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24

function recencyWeight(memory: Memory, now: string): number {
  const ageInDays = (Date.parse(now) - Date.parse(memory.updatedAt)) / MILLISECONDS_PER_DAY
  return Math.max(0, MAX_RECENCY_WEIGHT - ageInDays)
}

// Pure — "Pinned memories, Importance, Recency, Session relevance,
// Lifecycle state." A simple weighted sum; see
// `mapScoreToContextPriority.ts` for how the score becomes a tier.
export function computeContextPriorityScore(memory: Memory, sessionRelevant: boolean, now: string): number {
  let score = 0
  if (memory.pinned) score += PINNED_WEIGHT
  score += IMPORTANCE_WEIGHT[memory.importance]
  score += LIFECYCLE_WEIGHT[memory.lifecycle]
  score += recencyWeight(memory, now)
  if (sessionRelevant) score += SESSION_RELEVANCE_WEIGHT
  return score
}
