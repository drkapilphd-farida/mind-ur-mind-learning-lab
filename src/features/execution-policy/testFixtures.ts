// Shared test-only fixtures for this feature's own test suite — same
// convention as `@/features/provider-execution-engine/testFixtures.ts`.
// Not itself a *.test.ts file, so vitest's `include` glob never picks
// it up as a test file. Every builder's defaults are valid per this
// feature's own validators, so tests only need to override the one
// field under test.
import type {
  CancellationEligibilityPolicy,
  ExecutionConstraints,
  ExecutionDecision,
  ExecutionPolicyConfig,
  ExecutionPolicyDiagnostics,
  ExecutionPolicyRequest,
  ExecutionPolicyValidation,
  FallbackEligibilityPolicy,
  RetryEligibilityPolicy,
  TimeoutResolutionPolicy,
} from './types'

export function makeRetryEligibilityPolicy(overrides: Partial<RetryEligibilityPolicy> = {}): RetryEligibilityPolicy {
  return { maxAttempts: 3, backoffStrategy: 'fixed', ...overrides }
}

export function makeTimeoutResolutionPolicy(overrides: Partial<TimeoutResolutionPolicy> = {}): TimeoutResolutionPolicy {
  return { deadlineMs: 5000, ...overrides }
}

export function makeCancellationEligibilityPolicy(overrides: Partial<CancellationEligibilityPolicy> = {}): CancellationEligibilityPolicy {
  return { allowManualCancellation: true, allowSafetyCancellation: true, ...overrides }
}

export function makeFallbackEligibilityPolicy(overrides: Partial<FallbackEligibilityPolicy> = {}): FallbackEligibilityPolicy {
  return { allowFallback: true, fallbackProviderIds: ['anthropic', 'gemini'], ...overrides }
}

export function makeExecutionConstraints(overrides: Partial<ExecutionConstraints> = {}): ExecutionConstraints {
  return { eligibleProviderIds: ['openai', 'anthropic', 'gemini'], maxConcurrentAttempts: 3, safetyModerationRequired: false, ...overrides }
}

export function makeExecutionPolicyConfig(overrides: Partial<ExecutionPolicyConfig> = {}): ExecutionPolicyConfig {
  return {
    retryPolicy: makeRetryEligibilityPolicy(),
    timeoutPolicy: makeTimeoutResolutionPolicy(),
    cancellationPolicy: makeCancellationEligibilityPolicy(),
    fallbackPolicy: makeFallbackEligibilityPolicy(),
    constraints: makeExecutionConstraints(),
    ...overrides,
  }
}

export function makeExecutionPolicyRequest(overrides: Partial<ExecutionPolicyRequest> = {}): ExecutionPolicyRequest {
  return {
    providerId: 'openai',
    attemptCount: 0,
    attemptedProviderIds: [],
    elapsedMs: 0,
    previousProviderFailed: false,
    cancellationRequested: false,
    cancellationReason: 'none',
    ...overrides,
  }
}

export function makeExecutionDecision(overrides: Partial<ExecutionDecision> = {}): ExecutionDecision {
  return { decision: 'execute', reason: 'Execution may proceed.', fallbackProviderId: null, resolvedTimeoutMs: 5000, ...overrides }
}

export function makeExecutionPolicyValidation(overrides: Partial<ExecutionPolicyValidation> = {}): ExecutionPolicyValidation {
  return { valid: true, issues: [], ...overrides }
}

export function makeExecutionPolicyDiagnostics(overrides: Partial<ExecutionPolicyDiagnostics> = {}): ExecutionPolicyDiagnostics {
  return {
    providerId: 'openai',
    attemptCount: 0,
    decision: 'execute',
    reason: 'Execution may proceed.',
    fallbackProviderId: null,
    resolvedTimeoutMs: 5000,
    validationResult: makeExecutionPolicyValidation(),
    ...overrides,
  }
}
