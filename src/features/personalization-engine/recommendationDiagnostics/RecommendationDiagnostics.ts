// Inferred by direct analogy to `executionDiagnostics/ExecutionDiagnostics`
// (Sprint 25) — the Sprint 26 brief's own §6 only says "Generate
// diagnostics" without naming fields. Kept to the same minimal shape:
// a total count, a group count, validation status, and the set version.
export type RecommendationDiagnostics = {
  readonly totalRecommendations: number
  readonly groupCount: number
  readonly validationStatus: 'valid' | 'invalid'
  readonly setVersion: number
}
