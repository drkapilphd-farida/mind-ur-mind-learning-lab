import type { CancellationReason } from '../types'

// Immutable — every field `readonly`. The caller's own cancellation
// ask — "Support: Manual cancellation, Safety cancellation."
export type CancellationRequest = {
  readonly requested: boolean
  readonly reason: CancellationReason
}
