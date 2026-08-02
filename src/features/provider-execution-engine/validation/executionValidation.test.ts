import { describe, expect, it } from 'vitest'
import { validateExecutionSetup } from './validateExecutionSetup'
import { makeExecutionSession } from '../testFixtures'

describe('validateExecutionSetup', () => {
  it('reports valid: true for a well-formed session', () => {
    expect(validateExecutionSetup(makeExecutionSession())).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-execution-request for a blank request id', () => {
    const session = makeExecutionSession({ request: { id: '', providerId: 'openai', messageCount: 1, instructionCount: 1, payloadSummary: [] } })
    const result = validateExecutionSetup(session)
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-request')).toBe(true)
  })

  it('detects invalid-provider-config for an unknown provider id', () => {
    const session = makeExecutionSession({ request: { id: 'r1', providerId: 'unknown-provider', messageCount: 1, instructionCount: 1, payloadSummary: [] } })
    const result = validateExecutionSetup(session)
    expect(result.issues.some((issue) => issue.type === 'invalid-provider-config')).toBe(true)
  })

  it('detects invalid-retry-policy for maxAttempts below 1', () => {
    const session = makeExecutionSession({
      policy: {
        retryPolicy: { maxAttempts: 0, backoffStrategy: 'fixed' },
        timeoutPolicy: { deadlineMs: 5000 },
        cancellationPolicy: { allowManualCancellation: true, allowSafetyCancellation: true },
      },
    })
    const result = validateExecutionSetup(session)
    expect(result.issues.some((issue) => issue.type === 'invalid-retry-policy')).toBe(true)
  })

  it('detects invalid-timeout-policy for a non-positive deadline', () => {
    const session = makeExecutionSession({
      policy: {
        retryPolicy: { maxAttempts: 3, backoffStrategy: 'fixed' },
        timeoutPolicy: { deadlineMs: 0 },
        cancellationPolicy: { allowManualCancellation: true, allowSafetyCancellation: true },
      },
    })
    const result = validateExecutionSetup(session)
    expect(result.issues.some((issue) => issue.type === 'invalid-timeout-policy')).toBe(true)
  })

  it('detects invalid-cancellation-policy when neither cancellation type is permitted', () => {
    const session = makeExecutionSession({
      policy: {
        retryPolicy: { maxAttempts: 3, backoffStrategy: 'fixed' },
        timeoutPolicy: { deadlineMs: 5000 },
        cancellationPolicy: { allowManualCancellation: false, allowSafetyCancellation: false },
      },
    })
    const result = validateExecutionSetup(session)
    expect(result.issues.some((issue) => issue.type === 'invalid-cancellation-policy')).toBe(true)
  })

  it('detects invalid-execution-policy for a non-finite policy value', () => {
    const session = makeExecutionSession({
      policy: {
        retryPolicy: { maxAttempts: Number.NaN, backoffStrategy: 'fixed' },
        timeoutPolicy: { deadlineMs: 5000 },
        cancellationPolicy: { allowManualCancellation: true, allowSafetyCancellation: true },
      },
    })
    const result = validateExecutionSetup(session)
    expect(result.issues.some((issue) => issue.type === 'invalid-execution-policy')).toBe(true)
  })
})
