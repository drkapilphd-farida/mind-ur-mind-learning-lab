import type { CleanupPlan } from '../retentionDomain'

// Pure — "Validate execution order": a well-formed plan must evaluate
// every memory exactly once. Deterministic, structural — no ordering
// concept beyond "no duplicate targets," since candidates are executed
// as a single atomic transaction (see `cleanupExecution/`), not a
// sequence where relative order matters.
export function validateExecutionOrder(plan: CleanupPlan): boolean {
  const seenMemoryIds = new Set<string>()

  for (const candidate of plan.candidates) {
    if (seenMemoryIds.has(candidate.memoryId)) return false
    seenMemoryIds.add(candidate.memoryId)
  }

  return true
}
