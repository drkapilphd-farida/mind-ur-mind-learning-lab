import type { ExecutionPolicyRequest, FallbackEligibilityPolicy } from '../types'
import type { FallbackEligibilityDecision } from './FallbackEligibilityDecision'

// Pure — "fallback eligibility" (§ Responsibilities). Picks the first
// configured fallback id that isn't the current provider and hasn't
// already been attempted — the same runtime guard that keeps a
// misconfigured fallback chain from looping forever, complementing
// `../validation/validateCircularFallback.ts`'s own static config
// check.
export function decideFallbackEligibility(request: ExecutionPolicyRequest, policy: FallbackEligibilityPolicy): FallbackEligibilityDecision {
  if (!policy.allowFallback) {
    return { eligible: false, fallbackProviderId: null, reason: 'Fallback is not permitted by policy.' }
  }

  const candidate = policy.fallbackProviderIds.find((id) => id !== request.providerId && !request.attemptedProviderIds.includes(id))

  if (!candidate) {
    return { eligible: false, fallbackProviderId: null, reason: 'No untried fallback provider is available.' }
  }

  return { eligible: true, fallbackProviderId: candidate, reason: `Falling back to provider "${candidate}".` }
}
