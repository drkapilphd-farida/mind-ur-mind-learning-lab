import type { Memory } from '../domain'
import type { CleanupPlan, MemoryRetentionPolicy } from '../retentionDomain'
import { evaluateMemoriesAgainstPolicies } from './evaluateMemoriesAgainstPolicies'

// Pure — "Generate cleanup plans": the full evaluation record for
// every given memory against every given policy. "No automatic
// execution" — this never touches a repository, only produces a plain
// data value describing what *would* happen.
export function generateCleanupPlan(
  memories: readonly Memory[],
  policies: readonly MemoryRetentionPolicy[],
  now: string,
  id: string,
): CleanupPlan {
  return {
    id,
    policyIds: policies.map((policy) => policy.id),
    candidates: evaluateMemoriesAgainstPolicies(memories, policies, now),
    generatedAt: now,
  }
}
