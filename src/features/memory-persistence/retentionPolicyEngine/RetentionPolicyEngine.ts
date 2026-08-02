import type { Memory } from '../domain'
import type { MemoryRetentionPolicy } from '../retentionDomain'

// "Support deterministic policy evaluation based on: Memory lifecycle
// state, Age, Importance, Tags, Conversation association, Explicit pin
// status." A pure, deterministic decision function — no AI, no
// scoring, only rule matching.
export interface RetentionPolicyEngine {
  evaluate(policy: MemoryRetentionPolicy, memory: Memory, now: string): boolean
}
