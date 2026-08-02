import { computeBackoffDelay } from '../backoff'
import { createFailureClassifier } from '../failureClassification'
import type { FailureClassifier } from '../failureClassification'
import { createRetryDecisionResolver } from '../retryDecision'
import type { RetryDecisionResolver } from '../retryDecision'
import { evaluateRetryBudget } from '../retryBudget'
import type { BackoffPolicy, FailureSignal, RecoveryContext, RecoveryPlan, RecoveryStrategyType } from '../types'
import { validateBackoffPolicy, validateCircularRecovery, validateExecutionState, validateRecoveryStrategy, validateRetryPolicy } from '../validation'
import type { RecoveryEngine } from './RecoveryEngine'

export type RecoveryEngineDependencies = {
  backoffPolicy: BackoffPolicy
  classifier: FailureClassifier
  resolver: RetryDecisionResolver
}

const RETRY_STRATEGIES: readonly RecoveryStrategyType[] = ['retry-same-provider', 'retry-alternate-model', 'retry-alternate-provider']

// Implements RecoveryEngine. Validates the input first (reject before
// planning, mirroring `provider-execution-engine`'s own "reject before
// runtime" ordering) — any failure there produces an `abort-execution`
// plan rather than throwing. Otherwise classifies the failure,
// resolves a strategy, defensively re-validates that the resolved
// strategy actually has an available target, then computes the
// backoff delay and target ids for the chosen strategy.
export class DefaultRecoveryEngine implements RecoveryEngine {
  constructor(private readonly dependencies: RecoveryEngineDependencies) {}

  planRecovery(signal: FailureSignal, context: RecoveryContext): RecoveryPlan {
    const budgetStatus = evaluateRetryBudget(context.attemptCount, context.retryBudget)

    const inputIssues = [
      ...validateExecutionState(context).issues,
      ...validateRetryPolicy(context.retryBudget).issues,
      ...validateBackoffPolicy(this.dependencies.backoffPolicy).issues,
      ...validateCircularRecovery(context).issues,
    ]

    if (inputIssues.length > 0) {
      return {
        strategy: 'abort-execution',
        reason: inputIssues[0]?.detail ?? 'The recovery input was invalid.',
        backoffDelayMs: null,
        targetProviderId: null,
        targetModelId: null,
        retryBudgetStatus: budgetStatus,
      }
    }

    const category = this.dependencies.classifier.classify(signal)
    const strategy = this.dependencies.resolver.resolve(category, context)

    const strategyValidation = validateRecoveryStrategy(strategy, context)
    if (!strategyValidation.valid) {
      return {
        strategy: 'abort-execution',
        reason: strategyValidation.issues[0]?.detail ?? 'The resolved recovery strategy had no available target.',
        backoffDelayMs: null,
        targetProviderId: null,
        targetModelId: null,
        retryBudgetStatus: budgetStatus,
      }
    }

    const isRetry = RETRY_STRATEGIES.includes(strategy)
    const backoffDelayMs = isRetry ? computeBackoffDelay(context.attemptCount + 1, this.dependencies.backoffPolicy) : null

    const targetProviderId = strategy === 'retry-alternate-provider' ? (context.alternateProviderIds[0] ?? null) : strategy === 'execute-fallback' ? context.fallbackProviderId : null
    const targetModelId = strategy === 'retry-alternate-model' ? (context.alternateModelIds[0] ?? null) : null

    return {
      strategy,
      reason: `Failure classified as "${category}"; resolved strategy "${strategy}".`,
      backoffDelayMs,
      targetProviderId,
      targetModelId,
      retryBudgetStatus: budgetStatus,
    }
  }
}

export function createRecoveryEngine(backoffPolicy: BackoffPolicy, overrides: Partial<Pick<RecoveryEngineDependencies, 'classifier' | 'resolver'>> = {}): RecoveryEngine {
  return new DefaultRecoveryEngine({
    backoffPolicy,
    classifier: overrides.classifier ?? createFailureClassifier(),
    resolver: overrides.resolver ?? createRetryDecisionResolver(),
  })
}
