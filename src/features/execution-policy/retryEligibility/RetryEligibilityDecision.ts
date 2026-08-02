// Immutable — every field `readonly`.
export type RetryEligibilityDecision = {
  readonly eligible: boolean
  readonly reason: string
}
