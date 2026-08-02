import type { CancellationReason } from '../types'

// Immutable — every field `readonly`. "Execution cancellation,
// Propagation, Cancellation reason" (§ Cancellation) — `propagated` is
// `true` iff `cancelled` is `true`, a genuine, always-consistent
// signal that the decision was actually applied to the session, not
// merely computed.
export type CancellationDecision = {
  readonly cancelled: boolean
  readonly reason: CancellationReason | null
  readonly propagated: boolean
}
