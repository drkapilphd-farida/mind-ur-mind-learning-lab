// Learning Session Runtime™ (LSE-3). Error Recovery — real, honest
// diagnostics only. Every issue code names a real, checkable inconsistency
// between a real `AdaptiveRuntimeState` and the real `UniversalLearningObject`
// it claims to be built against — never a speculative or unverifiable
// condition.
export type RuntimeHealthIssueCode = 'ulo-mismatch' | 'ulo-version-stale' | 'position-corrupted' | 'empty-queue-while-active'

export type RuntimeHealthIssue = {
  code: RuntimeHealthIssueCode
  message: string
}

export type RuntimeHealthCheck = { healthy: true } | { healthy: false; issues: readonly RuntimeHealthIssue[] }
