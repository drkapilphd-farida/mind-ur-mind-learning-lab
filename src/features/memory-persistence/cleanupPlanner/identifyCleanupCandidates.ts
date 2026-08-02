import type { Memory } from '../domain'
import type { CleanupCandidate, MemoryRetentionPolicy } from '../retentionDomain'
import { evaluateMemoriesAgainstPolicies } from './evaluateMemoriesAgainstPolicies'

// Pure — "Identify cleanup candidates": memories whose matched policy's
// action is `'delete'`.
export function identifyCleanupCandidates(
  memories: readonly Memory[],
  policies: readonly MemoryRetentionPolicy[],
  now: string,
): readonly CleanupCandidate[] {
  return evaluateMemoriesAgainstPolicies(memories, policies, now).filter((candidate) => candidate.action === 'delete')
}
