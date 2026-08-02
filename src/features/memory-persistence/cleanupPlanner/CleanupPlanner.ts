import type { Memory } from '../domain'
import type { CleanupCandidate, CleanupPlan, MemoryRetentionPolicy } from '../retentionDomain'

// "Identify cleanup candidates, Identify archival candidates, Generate
// cleanup plans, Validate execution order. No automatic execution."
export interface CleanupPlanner {
  identifyCleanupCandidates(memories: readonly Memory[], policies: readonly MemoryRetentionPolicy[], now: string): readonly CleanupCandidate[]
  identifyArchivalCandidates(memories: readonly Memory[], policies: readonly MemoryRetentionPolicy[], now: string): readonly CleanupCandidate[]
  generatePlan(memories: readonly Memory[], policies: readonly MemoryRetentionPolicy[]): CleanupPlan
  validateExecutionOrder(plan: CleanupPlan): boolean
}
