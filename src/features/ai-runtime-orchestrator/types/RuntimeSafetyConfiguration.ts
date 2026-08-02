// Self-contained mirror of `request-execution-pipeline`'s own
// `SafetyConfiguration` — same literal shape, never imported
// cross-feature.
export type RuntimeSafetyConfiguration = {
  readonly moderationEnabled: boolean
  readonly blockedTerms: readonly string[]
}
