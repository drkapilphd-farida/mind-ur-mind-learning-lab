import type { Memory } from '../domain'
import type { MemoryRetentionPolicy } from '../retentionDomain'
import { evaluateRetentionRule } from './evaluateRetentionRule'

// Pure — "Policies must be composable and deterministic." A policy
// matches a memory iff *every* one of its rules matches (AND
// semantics, the same combinator convention as
// `specification/createCombinedSpecification.ts`) — a policy with no
// rules vacuously matches everything.
export function evaluateRetentionPolicy(policy: MemoryRetentionPolicy, memory: Memory, now: string): boolean {
  return policy.rules.every((rule) => evaluateRetentionRule(rule, memory, now))
}
