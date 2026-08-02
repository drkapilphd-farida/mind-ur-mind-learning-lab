import type { ExecutionCancellationPolicy } from '../types'
import type { CancellationDecision } from './CancellationDecision'
import type { CancellationRequest } from './CancellationRequest'

// Pure — "Support: Manual cancellation, Safety cancellation, Execution
// cancellation, Propagation, Cancellation reason." A request only
// results in cancellation when the policy actually permits that
// specific reason type — a request the policy forbids is deterministically
// refused, never silently honored.
export function decideCancellation(request: CancellationRequest, policy: ExecutionCancellationPolicy): CancellationDecision {
  if (!request.requested) return { cancelled: false, reason: null, propagated: false }

  const permitted =
    (request.reason === 'manual' && policy.allowManualCancellation) || (request.reason === 'safety' && policy.allowSafetyCancellation)

  if (!permitted) return { cancelled: false, reason: null, propagated: false }

  return { cancelled: true, reason: request.reason, propagated: true }
}
