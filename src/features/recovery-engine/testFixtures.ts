// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/execution-policy/testFixtures.ts`. Not
// itself a *.test.ts file, so vitest's `include` glob never picks it
// up as a test file. Every builder's defaults are valid per this
// feature's own validators, so tests only need to override the one
// field under test.
import type {
  BackoffPolicy,
  FailureSignal,
  RecoveryContext,
  RecoveryDiagnostics,
  RecoveryPlan,
  RecoveryValidation,
  RetryBudget,
  RetryBudgetStatus,
  RetryExecutionResult,
  RetryOutcome,
} from './types'

export function makeFailureSignal(overrides: Partial<FailureSignal> = {}): FailureSignal {
  return { errorCode: 'transient_error', timedOut: false, ...overrides }
}

export function makeBackoffPolicy(overrides: Partial<BackoffPolicy> = {}): BackoffPolicy {
  return { strategy: 'fixed', baseDelayMs: 1000, maxDelayMs: 30000, ...overrides }
}

export function makeRetryBudget(overrides: Partial<RetryBudget> = {}): RetryBudget {
  return { maxAttempts: 3, ...overrides }
}

export function makeRetryBudgetStatus(overrides: Partial<RetryBudgetStatus> = {}): RetryBudgetStatus {
  return { remaining: 2, exhausted: false, ...overrides }
}

export function makeRecoveryContext(overrides: Partial<RecoveryContext> = {}): RecoveryContext {
  return {
    providerId: 'openai',
    modelId: 'gpt-4o',
    attemptCount: 1,
    alternateModelIds: ['gpt-4o-mini'],
    alternateProviderIds: ['anthropic'],
    fallbackProviderId: 'gemini',
    retryBudget: makeRetryBudget(),
    ...overrides,
  }
}

export function makeRecoveryPlan(overrides: Partial<RecoveryPlan> = {}): RecoveryPlan {
  return {
    strategy: 'retry-same-provider',
    reason: 'Attempt is eligible for retry.',
    backoffDelayMs: 1000,
    targetProviderId: null,
    targetModelId: null,
    retryBudgetStatus: makeRetryBudgetStatus(),
    ...overrides,
  }
}

export function makeRetryOutcome(overrides: Partial<RetryOutcome> = {}): RetryOutcome {
  return { succeeded: true, responseText: 'Recovered response.', ...overrides }
}

export function makeRetryExecutionResult(overrides: Partial<RetryExecutionResult> = {}): RetryExecutionResult {
  return { executed: true, plan: makeRecoveryPlan(), succeeded: true, responseText: 'Recovered response.', ...overrides }
}

export function makeRecoveryValidation(overrides: Partial<RecoveryValidation> = {}): RecoveryValidation {
  return { valid: true, issues: [], ...overrides }
}

export function makeRecoveryDiagnostics(overrides: Partial<RecoveryDiagnostics> = {}): RecoveryDiagnostics {
  return {
    providerId: 'openai',
    failureCategory: 'transient-provider-failure',
    strategy: 'retry-same-provider',
    reason: 'Attempt is eligible for retry.',
    attemptCount: 1,
    backoffDelayMs: 1000,
    retryBudgetStatus: makeRetryBudgetStatus(),
    validationResult: makeRecoveryValidation(),
    ...overrides,
  }
}
