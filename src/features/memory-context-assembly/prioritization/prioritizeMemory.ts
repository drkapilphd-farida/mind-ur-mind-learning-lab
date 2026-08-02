import type { Memory } from '@/features/memory-persistence'
import { computeContextPriorityScore } from './computeContextPriorityScore'
import { mapScoreToContextPriority } from './mapScoreToContextPriority'
import { describeContextPriorityReason } from './describeContextPriorityReason'
import type { PrioritizedMemory } from './PrioritizedMemory'

// Pure — the one entry point `assembly/` calls: score, map to a tier,
// and describe why, in one step.
export function prioritizeMemory(memory: Memory, sessionRelevant: boolean, now: string): PrioritizedMemory {
  const score = computeContextPriorityScore(memory, sessionRelevant, now)
  return {
    memory,
    priority: mapScoreToContextPriority(score),
    reason: describeContextPriorityReason(memory, sessionRelevant),
  }
}
