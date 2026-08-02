import { evaluateRetryBudget } from '../retryBudget'
import type { FailureCategory, RecoveryContext, RecoveryStrategyType } from '../types'
import type { RetryDecisionResolver } from './RetryDecisionResolver'

// Implements RetryDecisionResolver — real, distinct logic per failure
// category, not just "retry vs. give up":
//
// - timeout / transient-provider-failure: prefer retrying the same
//   provider while budget remains, then an alternate model, then
//   fallback, then abort.
// - rate-limit: retrying the *same* rate-limited provider is
//   pointless — prefer an alternate provider immediately, then
//   fallback, then (only as a last resort) the same provider if
//   budget remains, then abort.
// - provider-unavailable: same "don't retry the thing that's down"
//   reasoning — an alternate provider or fallback, else abort.
// - retry-exhaustion: budget is already gone — fallback or abort.
// - unknown: `abort-execution`, the safe default.
export class DefaultRetryDecisionResolver implements RetryDecisionResolver {
  resolve(category: FailureCategory, context: RecoveryContext): RecoveryStrategyType {
    const budgetStatus = evaluateRetryBudget(context.attemptCount, context.retryBudget)

    switch (category) {
      case 'timeout':
      case 'transient-provider-failure': {
        if (!budgetStatus.exhausted) return 'retry-same-provider'
        if (context.alternateModelIds.length > 0) return 'retry-alternate-model'
        if (context.fallbackProviderId !== null) return 'execute-fallback'
        return 'abort-execution'
      }

      case 'rate-limit': {
        if (context.alternateProviderIds.length > 0) return 'retry-alternate-provider'
        if (context.fallbackProviderId !== null) return 'execute-fallback'
        if (!budgetStatus.exhausted) return 'retry-same-provider'
        return 'abort-execution'
      }

      case 'provider-unavailable': {
        if (context.alternateProviderIds.length > 0) return 'retry-alternate-provider'
        if (context.fallbackProviderId !== null) return 'execute-fallback'
        return 'abort-execution'
      }

      case 'retry-exhaustion': {
        if (context.fallbackProviderId !== null) return 'execute-fallback'
        return 'abort-execution'
      }

      case 'unknown':
      default:
        return 'abort-execution'
    }
  }
}

export function createRetryDecisionResolver(): RetryDecisionResolver {
  return new DefaultRetryDecisionResolver()
}
