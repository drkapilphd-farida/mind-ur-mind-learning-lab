import type { Memory } from '../domain'
import type { MemoryRetentionPolicy } from '../retentionDomain'
import { evaluateRetentionPolicy } from './evaluateRetentionPolicy'
import type { RetentionPolicyEngine } from './RetentionPolicyEngine'

// Implements RetentionPolicyEngine — a thin, stateless wrapper around
// `evaluateRetentionPolicy`, the same "class wraps pure function"
// convention this feature already uses (e.g.
// `indexMaintenance/DefaultIndexMaintenanceService.ts`).
export class DefaultRetentionPolicyEngine implements RetentionPolicyEngine {
  evaluate(policy: MemoryRetentionPolicy, memory: Memory, now: string): boolean {
    return evaluateRetentionPolicy(policy, memory, now)
  }
}

export function createRetentionPolicyEngine(): RetentionPolicyEngine {
  return new DefaultRetentionPolicyEngine()
}
