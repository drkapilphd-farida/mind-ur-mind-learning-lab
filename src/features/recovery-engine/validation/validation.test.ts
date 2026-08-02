import { describe, expect, it } from 'vitest'
import { validateRetryPolicy } from './validateRetryPolicy'
import { validateBackoffPolicy } from './validateBackoffPolicy'
import { validateRetryBudgetExceeded } from './validateRetryBudgetExceeded'
import { validateCircularRecovery } from './validateCircularRecovery'
import { validateRecoveryStrategy } from './validateRecoveryStrategy'
import { validateRecoveryDiagnostics } from './validateRecoveryDiagnostics'
import { validateExecutionState } from './validateExecutionState'
import { makeBackoffPolicy, makeRecoveryContext, makeRecoveryDiagnostics, makeRetryBudget } from '../testFixtures'

describe('validateRetryPolicy (Invalid retry policy)', () => {
  it('detects invalid-retry-policy for maxAttempts below 1', () => {
    const result = validateRetryPolicy(makeRetryBudget({ maxAttempts: 0 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-retry-policy')).toBe(true)
  })
})

describe('validateBackoffPolicy (Invalid backoff)', () => {
  it('reports valid: true for a well-formed policy', () => {
    expect(validateBackoffPolicy(makeBackoffPolicy())).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-backoff for a non-positive baseDelayMs', () => {
    const result = validateBackoffPolicy(makeBackoffPolicy({ baseDelayMs: 0 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-backoff')).toBe(true)
  })

  it('detects invalid-backoff when maxDelayMs is less than baseDelayMs', () => {
    const result = validateBackoffPolicy(makeBackoffPolicy({ baseDelayMs: 5000, maxDelayMs: 1000 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-backoff')).toBe(true)
  })
})

describe('validateRetryBudgetExceeded (Retry budget exceeded)', () => {
  it('reports valid: true when attempts remain', () => {
    expect(validateRetryBudgetExceeded(makeRecoveryContext({ attemptCount: 1, retryBudget: { maxAttempts: 3 } }))).toEqual({ valid: true, issues: [] })
  })

  it('detects retry-budget-exceeded once attemptCount reaches maxAttempts', () => {
    const result = validateRetryBudgetExceeded(makeRecoveryContext({ attemptCount: 3, retryBudget: { maxAttempts: 3 } }))
    expect(result.issues.some((issue) => issue.type === 'retry-budget-exceeded')).toBe(true)
  })
})

describe('validateCircularRecovery (Circular recovery)', () => {
  it('detects circular-recovery when the fallback points at the current provider', () => {
    const result = validateCircularRecovery(makeRecoveryContext({ providerId: 'openai', fallbackProviderId: 'openai' }))
    expect(result.issues.some((issue) => issue.type === 'circular-recovery')).toBe(true)
  })

  it('detects circular-recovery for a duplicated alternate provider id', () => {
    const result = validateCircularRecovery(makeRecoveryContext({ alternateProviderIds: ['anthropic', 'anthropic'] }))
    expect(result.issues.some((issue) => issue.type === 'circular-recovery')).toBe(true)
  })
})

describe('validateRecoveryStrategy (Invalid recovery strategy)', () => {
  it('detects invalid-recovery-strategy when retry-alternate-model has no alternate models', () => {
    const result = validateRecoveryStrategy('retry-alternate-model', makeRecoveryContext({ alternateModelIds: [] }))
    expect(result.issues.some((issue) => issue.type === 'invalid-recovery-strategy')).toBe(true)
  })

  it('detects invalid-recovery-strategy when execute-fallback has no fallback provider', () => {
    const result = validateRecoveryStrategy('execute-fallback', makeRecoveryContext({ fallbackProviderId: null }))
    expect(result.issues.some((issue) => issue.type === 'invalid-recovery-strategy')).toBe(true)
  })

  it('reports valid: true for abort-execution regardless of context', () => {
    expect(validateRecoveryStrategy('abort-execution', makeRecoveryContext({ alternateModelIds: [], alternateProviderIds: [], fallbackProviderId: null }))).toEqual({
      valid: true,
      issues: [],
    })
  })
})

describe('validateRecoveryDiagnostics (Missing diagnostics)', () => {
  it('detects missing-diagnostics for an empty reason', () => {
    const result = validateRecoveryDiagnostics(makeRecoveryDiagnostics({ reason: '' }))
    expect(result.issues.some((issue) => issue.type === 'missing-diagnostics')).toBe(true)
  })
})

describe('validateExecutionState (Invalid execution state)', () => {
  it('detects invalid-execution-state for a blank providerId', () => {
    const result = validateExecutionState(makeRecoveryContext({ providerId: '' }))
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-state')).toBe(true)
  })

  it('detects invalid-execution-state for a negative attemptCount', () => {
    const result = validateExecutionState(makeRecoveryContext({ attemptCount: -1 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-state')).toBe(true)
  })
})
