import type { CancellationEligibilityPolicy, ExecutionPolicyRequest } from '../types'
import type { CancellationEligibilityDecision } from './CancellationEligibilityDecision'

// Pure — "cancellation eligibility" (§ Responsibilities). A request
// only results in eligible cancellation when the policy actually
// permits that specific reason type — a request the policy forbids is
// deterministically refused, never silently honored. Mirrors
// `provider-execution-engine`'s own `decideCancellation.ts`.
export function decideCancellationEligibility(request: ExecutionPolicyRequest, policy: CancellationEligibilityPolicy): CancellationEligibilityDecision {
  if (!request.cancellationRequested) return { eligible: false, reason: null }

  const permitted =
    (request.cancellationReason === 'manual' && policy.allowManualCancellation) ||
    (request.cancellationReason === 'safety' && policy.allowSafetyCancellation)

  if (!permitted) return { eligible: false, reason: null }

  return { eligible: true, reason: request.cancellationReason }
}
