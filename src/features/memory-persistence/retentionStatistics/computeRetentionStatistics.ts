import type { Memory } from '../domain'
import type { CleanupPlan } from '../retentionDomain'
import type { RetentionStatistics } from './RetentionStatistics'

// Pure — computed on demand from a given memories snapshot and an
// optional, already-generated plan (never triggers evaluation itself —
// "diagnostics only").
export function computeRetentionStatistics(memories: readonly Memory[], plan: CleanupPlan | null): RetentionStatistics {
  const activeMemories = memories.filter((memory) => memory.lifecycle === 'active').length
  const archivedMemories = memories.filter((memory) => memory.lifecycle === 'archived').length

  const cleanupCandidates = plan ? plan.candidates.filter((candidate) => candidate.action === 'delete').length : 0
  const retentionPolicyMatches = plan ? plan.candidates.filter((candidate) => candidate.action !== 'skip').length : 0

  return {
    activeMemories,
    archivedMemories,
    cleanupCandidates,
    retentionPolicyMatches,
    lastCleanupEvaluation: plan ? plan.generatedAt : null,
    repositoryHealthSummary: `${memories.length} total memories tracked (${activeMemories} active, ${archivedMemories} archived).`,
  }
}
