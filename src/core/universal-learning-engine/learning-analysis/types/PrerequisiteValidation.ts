// AI Learning Analysis Engine™ (UCE-5). Real — a cycle in the
// prerequisite/depends-on/builds-upon edge subgraph is a genuine logical
// inconsistency (concept A requires B requires A), not a judgment call.
// This is the same real algorithm's own precondition check as
// internal/topologicalSort.ts — a topological order is mathematically
// impossible when a cycle exists, so validation and ordering share one
// implementation rather than two that could disagree.
export type PrerequisiteValidationIssueType = 'cycle'

export type PrerequisiteValidationIssue = {
  type: PrerequisiteValidationIssueType
  // Every concept that could not be given a valid learning order —
  // honestly, this includes both concepts directly participating in a
  // real cycle AND concepts that merely transitively depend on one (see
  // internal/topologicalSort.ts's own `unorderedConceptIds` comment).
  conceptNodeIds: readonly string[]
  description: string
}

export type PrerequisiteValidation = {
  valid: boolean
  issues: readonly PrerequisiteValidationIssue[]
}
