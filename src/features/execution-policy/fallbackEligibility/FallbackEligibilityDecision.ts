// Immutable — every field `readonly`.
export type FallbackEligibilityDecision = {
  readonly eligible: boolean
  readonly fallbackProviderId: string | null
  readonly reason: string
}
