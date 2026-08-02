import { describe, expect, it } from 'vitest'
import { createProviderExecutionEngine } from './DefaultProviderExecutionEngine'
import { makeExecutionOrchestrationInputs, makeExecutionPolicy, makeProviderRequest, makeProviderRequestWithProviderId } from '../testFixtures'

describe('DefaultProviderExecutionEngine', () => {
  it('Happy Path: a single successful attempt reaches completed', () => {
    const engine = createProviderExecutionEngine()
    const { session, result, validationResult } = engine.generate(makeExecutionOrchestrationInputs({ attemptOutcomes: ['success'] }))

    expect(validationResult.valid).toBe(true)
    expect(session.state).toBe('completed')
    expect(result).toMatchObject({ finalState: 'completed', attemptCount: 1, failureReason: null, cancellationReason: null, timeoutReason: null })
  })

  it('Retry: a failure followed by a success retries once then completes', () => {
    const engine = createProviderExecutionEngine()
    const { session, result } = engine.generate(makeExecutionOrchestrationInputs({ attemptOutcomes: ['failure', 'success'] }))

    expect(session.state).toBe('completed')
    expect(result).toMatchObject({ finalState: 'completed', attemptCount: 2 })
  })

  it('Cancellation: a permitted manual cancellation request short-circuits before any attempt runs', () => {
    const engine = createProviderExecutionEngine()
    const { session, result } = engine.generate(
      makeExecutionOrchestrationInputs({
        attemptOutcomes: ['success'],
        cancellationRequest: { requested: true, reason: 'manual' },
      }),
    )

    expect(session.state).toBe('cancelled')
    expect(result).toMatchObject({ finalState: 'cancelled', attemptCount: 0, cancellationReason: 'manual', failureReason: null, timeoutReason: null })
  })

  it('Timeout: a lone timeout outcome with no retries left lands on the timeout state', () => {
    const engine = createProviderExecutionEngine()
    const { session, result } = engine.generate(
      makeExecutionOrchestrationInputs({
        attemptOutcomes: ['timeout'],
        policy: makeExecutionPolicy({ retryPolicy: { maxAttempts: 1, backoffStrategy: 'fixed' } }),
      }),
    )

    expect(session.state).toBe('timeout')
    expect(result.timeoutReason).not.toBeNull()
    expect(result).toMatchObject({ finalState: 'timeout', attemptCount: 1, failureReason: null, cancellationReason: null })
  })

  it('Invalid Request: a blank provider-request id is rejected before any state progression', () => {
    const engine = createProviderExecutionEngine()
    const { session, result, validationResult } = engine.generate(
      makeExecutionOrchestrationInputs({ providerRequest: makeProviderRequest({ id: '' }) }),
    )

    expect(validationResult.valid).toBe(false)
    expect(validationResult.issues.some((issue) => issue.type === 'invalid-execution-request')).toBe(true)
    expect(session.state).toBe('pending')
    expect(result.failureReason).toBe('Execution rejected before runtime: invalid setup.')
  })

  it('Invalid Provider: an unrecognized provider id is rejected before any state progression', () => {
    const engine = createProviderExecutionEngine()
    const { session, result, validationResult } = engine.generate(
      makeExecutionOrchestrationInputs({
        providerRequest: makeProviderRequestWithProviderId('unknown-provider'),
      }),
    )

    expect(validationResult.valid).toBe(false)
    expect(validationResult.issues.some((issue) => issue.type === 'invalid-provider-config')).toBe(true)
    expect(session.state).toBe('pending')
    expect(result.failureReason).toBe('Execution rejected before runtime: invalid setup.')
  })

  it('Execution Failure: a lone failure outcome with no retries left lands on the failed state', () => {
    const engine = createProviderExecutionEngine()
    const { session, result } = engine.generate(
      makeExecutionOrchestrationInputs({
        attemptOutcomes: ['failure'],
        policy: makeExecutionPolicy({ retryPolicy: { maxAttempts: 1, backoffStrategy: 'fixed' } }),
      }),
    )

    expect(session.state).toBe('failed')
    expect(result.failureReason).not.toBeNull()
    expect(result).toMatchObject({ finalState: 'failed', attemptCount: 1, cancellationReason: null, timeoutReason: null })
  })

  it('Multiple Attempts: repeated failures across the full retry budget still resolve to a final success', () => {
    const engine = createProviderExecutionEngine()
    const { session, result } = engine.generate(
      makeExecutionOrchestrationInputs({
        attemptOutcomes: ['failure', 'timeout', 'success'],
        policy: makeExecutionPolicy({ retryPolicy: { maxAttempts: 3, backoffStrategy: 'fixed' } }),
      }),
    )

    expect(session.state).toBe('completed')
    expect(result).toMatchObject({ finalState: 'completed', attemptCount: 3 })
  })

  it('Policy Override: a tighter maxAttempts than the default fails fast instead of retrying', () => {
    const engine = createProviderExecutionEngine()
    const { session, result } = engine.generate(
      makeExecutionOrchestrationInputs({
        attemptOutcomes: ['failure', 'success'],
        policy: makeExecutionPolicy({ retryPolicy: { maxAttempts: 1, backoffStrategy: 'fixed' } }),
      }),
    )

    expect(session.state).toBe('failed')
    expect(result).toMatchObject({ finalState: 'failed', attemptCount: 1 })
  })

  it('Configuration Errors: a non-finite policy value is rejected before any state progression', () => {
    const engine = createProviderExecutionEngine()
    const { session, result, validationResult } = engine.generate(
      makeExecutionOrchestrationInputs({
        policy: makeExecutionPolicy({ retryPolicy: { maxAttempts: Number.NaN, backoffStrategy: 'fixed' } }),
      }),
    )

    expect(validationResult.valid).toBe(false)
    expect(validationResult.issues.some((issue) => issue.type === 'invalid-execution-policy')).toBe(true)
    expect(session.state).toBe('pending')
    expect(result.failureReason).toBe('Execution rejected before runtime: invalid setup.')
  })
})
