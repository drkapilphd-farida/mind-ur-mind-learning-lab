import { describe, expect, it } from 'vitest'
import { generateExecutionRuntimeDiagnostics } from './generateExecutionRuntimeDiagnostics'
import { makeExecutionResult, makeExecutionSession } from '../testFixtures'

describe('generateExecutionRuntimeDiagnostics', () => {
  it('collects the execution id, provider, strategy, attempt count, states, reasons, and elapsed metadata', () => {
    const session = makeExecutionSession({
      id: 'session-1',
      request: { id: 'req-1', providerId: 'openai', messageCount: 6, instructionCount: 2, payloadSummary: ['system', 'user'] },
      policy: {
        retryPolicy: { maxAttempts: 3, backoffStrategy: 'exponential' },
        timeoutPolicy: { deadlineMs: 5000 },
        cancellationPolicy: { allowManualCancellation: true, allowSafetyCancellation: true },
      },
    })
    const result = makeExecutionResult({ sessionId: 'session-1', finalState: 'completed', attemptCount: 1 })

    const diagnostics = generateExecutionRuntimeDiagnostics(session, result, ['pending->preparing', 'preparing->ready'])

    expect(diagnostics).toEqual({
      executionId: 'session-1',
      providerId: 'openai',
      strategy: 'exponential',
      attemptCount: 1,
      startState: 'pending',
      endState: 'completed',
      failureReason: null,
      cancellationReason: null,
      timeoutReason: null,
      elapsedMetadata: ['pending->preparing', 'preparing->ready'],
    })
  })
})
