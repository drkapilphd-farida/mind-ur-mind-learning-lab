import type { Memory } from '../domain'
import type { CleanupCandidate, MemoryRetentionPolicy } from '../retentionDomain'
import { evaluateRetentionPolicy } from '../retentionPolicyEngine'

// Pure — evaluates every memory against every policy, first-match-wins
// (deterministic: policies are tried in the given array order). A
// memory matching no policy gets an explicit `'skip'` candidate — a
// plan is a complete evaluation record, not just a filtered list.
export function evaluateMemoriesAgainstPolicies(
  memories: readonly Memory[],
  policies: readonly MemoryRetentionPolicy[],
  now: string,
): readonly CleanupCandidate[] {
  return memories.map((memory) => {
    const matched = policies.find((policy) => evaluateRetentionPolicy(policy, memory, now))

    if (!matched) {
      return { memoryId: memory.id, action: 'skip', matchedPolicyId: null, reason: 'No retention policy matched.' }
    }

    return {
      memoryId: memory.id,
      action: matched.action,
      matchedPolicyId: matched.id,
      reason: `Matched policy "${matched.name}".`,
    }
  })
}
