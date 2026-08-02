// Renamed from the brief's own "FallbackPolicy" for family
// consistency — echoes the brief's own "fallback eligibility"
// language.
export type FallbackEligibilityPolicy = {
  readonly allowFallback: boolean
  readonly fallbackProviderIds: readonly string[]
}
