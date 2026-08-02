// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities. "Provider eligibility," "execution limits," and
// "safety constraints" (§ Responsibilities) fold into this one bundle
// rather than 3 more named components — the brief lists them only as
// decision inputs, not as dedicated types.
export type ExecutionConstraints = {
  readonly eligibleProviderIds: readonly string[]
  readonly maxConcurrentAttempts: number
  readonly safetyModerationRequired: boolean
}
