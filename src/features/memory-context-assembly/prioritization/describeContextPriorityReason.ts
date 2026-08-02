import type { Memory } from '@/features/memory-persistence'

// Pure — a short, human-readable summary of which factors contributed
// to a memory's priority, for `ContextReference.reason`.
export function describeContextPriorityReason(memory: Memory, sessionRelevant: boolean): string {
  const factors: string[] = []
  if (memory.pinned) factors.push('pinned')
  factors.push(`importance=${memory.importance}`)
  factors.push(`lifecycle=${memory.lifecycle}`)
  if (sessionRelevant) factors.push('session-relevant')
  return factors.join(', ')
}
