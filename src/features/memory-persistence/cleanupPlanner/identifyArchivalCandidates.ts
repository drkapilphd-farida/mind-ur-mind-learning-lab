import type { Memory } from '../domain'
import type { CleanupCandidate, MemoryRetentionPolicy } from '../retentionDomain'
import { evaluateMemoriesAgainstPolicies } from './evaluateMemoriesAgainstPolicies'

// Pure — "Identify archival candidates": memories whose matched
// policy's action is `'archive'`.
export function identifyArchivalCandidates(
  memories: readonly Memory[],
  policies: readonly MemoryRetentionPolicy[],
  now: string,
): readonly CleanupCandidate[] {
  return evaluateMemoriesAgainstPolicies(memories, policies, now).filter((candidate) => candidate.action === 'archive')
}
