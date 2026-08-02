// Immutable — every field `readonly`. Same `learnerId`/`source`
// convention as `PersonalizationMetadata` (Sprint 23), plus `profileId`
// and `generatedAt` since an execution plan is always traceable back to
// the exact profile and moment it was produced from.
export type ExecutionMetadata = {
  readonly learnerId: string
  readonly profileId: string
  readonly source: string
  readonly generatedAt: string
}
