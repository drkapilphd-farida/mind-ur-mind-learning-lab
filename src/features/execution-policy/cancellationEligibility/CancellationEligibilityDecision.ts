import type { CancellationRequestReason } from '../types'

// Immutable — every field `readonly`.
export type CancellationEligibilityDecision = {
  readonly eligible: boolean
  readonly reason: CancellationRequestReason | null
}
