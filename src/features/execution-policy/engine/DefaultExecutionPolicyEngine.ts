import { decideCancellationEligibility } from '../cancellationEligibility'
import { decideFallbackEligibility } from '../fallbackEligibility'
import { decideRetryEligibility } from '../retryEligibility'
import { resolveTimeout } from '../timeoutResolution'
import type { ExecutionDecision, ExecutionPolicyConfig, ExecutionPolicyRequest } from '../types'
import { validateExecutionState } from '../validation'
import type { ExecutionPolicyEngine } from './ExecutionPolicyEngine'

// Implements ExecutionPolicyEngine — "Support deterministic execution
// decisions for" (§ Responsibilities). `decide()`'s own order:
// validate the request shape → provider eligibility → cancellation →
// (on a failed previous attempt *or* an expired timeout) try
// fallback, then retry, else reject → otherwise `execute` with the
// resolved remaining timeout budget. This is the one place all 5
// `ExecutionDecision` values are reachable.
export class DefaultExecutionPolicyEngine implements ExecutionPolicyEngine {
  constructor(private readonly config: ExecutionPolicyConfig) {}

  decide(request: ExecutionPolicyRequest): ExecutionDecision {
    const requestValidation = validateExecutionState(request)
    if (!requestValidation.valid) {
      return { decision: 'reject', reason: requestValidation.issues[0]?.detail ?? 'Invalid execution state.', fallbackProviderId: null, resolvedTimeoutMs: null }
    }

    if (!this.config.constraints.eligibleProviderIds.includes(request.providerId)) {
      return { decision: 'reject', reason: `Provider "${request.providerId}" is not eligible for execution.`, fallbackProviderId: null, resolvedTimeoutMs: null }
    }

    const cancellationDecision = decideCancellationEligibility(request, this.config.cancellationPolicy)
    if (cancellationDecision.eligible) {
      return { decision: 'cancel', reason: `Execution cancelled (${cancellationDecision.reason}).`, fallbackProviderId: null, resolvedTimeoutMs: null }
    }

    const timeoutDecision = resolveTimeout(request.elapsedMs, this.config.timeoutPolicy)
    const needsRecovery = request.previousProviderFailed || timeoutDecision.expired

    if (needsRecovery) {
      const fallbackDecision = decideFallbackEligibility(request, this.config.fallbackPolicy)
      if (fallbackDecision.eligible) {
        return { decision: 'fallback', reason: fallbackDecision.reason, fallbackProviderId: fallbackDecision.fallbackProviderId, resolvedTimeoutMs: null }
      }

      const retryDecision = decideRetryEligibility(request.attemptCount, this.config.retryPolicy)
      if (retryDecision.eligible) {
        return { decision: 'retry', reason: retryDecision.reason, fallbackProviderId: null, resolvedTimeoutMs: null }
      }

      return { decision: 'reject', reason: 'Retries exhausted and no fallback provider is available.', fallbackProviderId: null, resolvedTimeoutMs: null }
    }

    return { decision: 'execute', reason: 'Execution may proceed.', fallbackProviderId: null, resolvedTimeoutMs: timeoutDecision.remainingMs }
  }
}

export function createExecutionPolicyEngine(config: ExecutionPolicyConfig): ExecutionPolicyEngine {
  return new DefaultExecutionPolicyEngine(config)
}
