// Renamed from the brief's own "CancellationPolicy" for family
// consistency — echoes the brief's own "cancellation eligibility"
// language.
export type CancellationEligibilityPolicy = {
  readonly allowManualCancellation: boolean
  readonly allowSafetyCancellation: boolean
}
