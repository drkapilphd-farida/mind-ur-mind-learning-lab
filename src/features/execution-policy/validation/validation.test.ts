import { describe, expect, it } from 'vitest'
import { validateMissingPolicy } from './validateMissingPolicy'
import { validateTimeoutPolicy } from './validateTimeoutPolicy'
import { validateRetryPolicy } from './validateRetryPolicy'
import { validateFallbackPolicy } from './validateFallbackPolicy'
import { validateExecutionConstraints } from './validateExecutionConstraints'
import { validateCircularFallback } from './validateCircularFallback'
import { validateExecutionState } from './validateExecutionState'
import { validateExecutionPolicyDiagnostics } from './validateExecutionPolicyDiagnostics'
import {
  makeExecutionConstraints,
  makeExecutionPolicyConfig,
  makeExecutionPolicyDiagnostics,
  makeExecutionPolicyRequest,
  makeFallbackEligibilityPolicy,
  makeRetryEligibilityPolicy,
  makeTimeoutResolutionPolicy,
} from '../testFixtures'

describe('validateMissingPolicy (Missing policy)', () => {
  it('reports valid: true when at least one provider is eligible', () => {
    expect(validateMissingPolicy(makeExecutionPolicyConfig())).toEqual({ valid: true, issues: [] })
  })

  it('detects missing-policy when no providers are eligible', () => {
    const config = makeExecutionPolicyConfig({ constraints: makeExecutionConstraints({ eligibleProviderIds: [] }) })
    expect(validateMissingPolicy(config).issues.some((issue) => issue.type === 'missing-policy')).toBe(true)
  })
})

describe('validateTimeoutPolicy (Invalid timeout)', () => {
  it('detects invalid-timeout for a non-positive deadline', () => {
    const result = validateTimeoutPolicy(makeTimeoutResolutionPolicy({ deadlineMs: 0 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-timeout')).toBe(true)
  })
})

describe('validateRetryPolicy (Invalid retry count)', () => {
  it('detects invalid-retry-count for maxAttempts below 1', () => {
    const result = validateRetryPolicy(makeRetryEligibilityPolicy({ maxAttempts: 0 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-retry-count')).toBe(true)
  })
})

describe('validateFallbackPolicy (Invalid fallback)', () => {
  it('detects invalid-fallback when fallback is allowed but no providers are configured', () => {
    const result = validateFallbackPolicy(makeFallbackEligibilityPolicy({ allowFallback: true, fallbackProviderIds: [] }))
    expect(result.issues.some((issue) => issue.type === 'invalid-fallback')).toBe(true)
  })
})

describe('validateExecutionConstraints (Invalid constraint)', () => {
  it('detects invalid-constraint for a non-positive maxConcurrentAttempts', () => {
    const result = validateExecutionConstraints(makeExecutionConstraints({ maxConcurrentAttempts: 0 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-constraint')).toBe(true)
  })
})

describe('validateCircularFallback (Circular fallback)', () => {
  it('reports valid: true for a fallback chain with no duplicates', () => {
    expect(validateCircularFallback(makeFallbackEligibilityPolicy({ fallbackProviderIds: ['anthropic', 'gemini'] }))).toEqual({ valid: true, issues: [] })
  })

  it('detects circular-fallback for a duplicated provider id', () => {
    const result = validateCircularFallback(makeFallbackEligibilityPolicy({ fallbackProviderIds: ['anthropic', 'anthropic'] }))
    expect(result.issues.some((issue) => issue.type === 'circular-fallback')).toBe(true)
  })
})

describe('validateExecutionState (Invalid execution state)', () => {
  it('detects invalid-execution-state for a negative attemptCount', () => {
    const result = validateExecutionState(makeExecutionPolicyRequest({ attemptCount: -1 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-state')).toBe(true)
  })

  it('detects invalid-execution-state for a negative elapsedMs', () => {
    const result = validateExecutionState(makeExecutionPolicyRequest({ elapsedMs: -1 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-state')).toBe(true)
  })

  it('detects invalid-execution-state for a cancellation request with reason "none"', () => {
    const result = validateExecutionState(makeExecutionPolicyRequest({ cancellationRequested: true, cancellationReason: 'none' }))
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-state')).toBe(true)
  })
})

describe('validateExecutionPolicyDiagnostics (Missing diagnostics)', () => {
  it('reports valid: true for a well-formed diagnostics record', () => {
    expect(validateExecutionPolicyDiagnostics(makeExecutionPolicyDiagnostics())).toEqual({ valid: true, issues: [] })
  })

  it('detects missing-diagnostics for an empty reason', () => {
    const result = validateExecutionPolicyDiagnostics(makeExecutionPolicyDiagnostics({ reason: '' }))
    expect(result.issues.some((issue) => issue.type === 'missing-diagnostics')).toBe(true)
  })

  it('detects missing-diagnostics for an empty providerId', () => {
    const result = validateExecutionPolicyDiagnostics(makeExecutionPolicyDiagnostics({ providerId: '' }))
    expect(result.issues.some((issue) => issue.type === 'missing-diagnostics')).toBe(true)
  })
})
