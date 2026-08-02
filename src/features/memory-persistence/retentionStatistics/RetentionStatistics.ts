// Immutable — every field `readonly`. "Active memories, Archived
// memories, Cleanup candidates, Retention policy matches, Last cleanup
// evaluation, Repository health summary... Diagnostics only." —
// `cleanupCandidates` counts only delete-track candidates from the
// given plan; `retentionPolicyMatches` counts every non-skip candidate
// (archive + delete) — "any policy decided something about this
// memory."
export type RetentionStatistics = {
  readonly activeMemories: number
  readonly archivedMemories: number
  readonly cleanupCandidates: number
  readonly retentionPolicyMatches: number
  readonly lastCleanupEvaluation: string | null
  readonly repositoryHealthSummary: string
}
