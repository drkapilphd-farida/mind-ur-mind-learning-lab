import { describe, expect, it } from 'vitest'
import { createSessionFailureHandler } from './DefaultSessionFailureHandler'
import { makeAIExecutionSession } from '../testFixtures'

describe('DefaultSessionFailureHandler (Failure completion)', () => {
  it('produces a "failed" result for a non-cancelled session', () => {
    const handler = createSessionFailureHandler()
    const session = makeAIExecutionSession({ state: 'failed' })

    const result = handler.handle(session, 'missing-response', 'The outcome had no response text.')

    expect(result.completionStatus).toBe('failed')
    expect(result.result).toBeNull()
    expect(result.failureReason).toBe('The outcome had no response text.')
    expect(result.validationResult.issues[0]).toEqual({ type: 'missing-response', detail: 'The outcome had no response text.' })
  })

  it('produces a "cancelled" result when the session state is cancelled', () => {
    const handler = createSessionFailureHandler()
    const session = makeAIExecutionSession({ state: 'cancelled' })

    const result = handler.handle(session, 'invalid-transition', 'Cancelled before request execution.')

    expect(result.completionStatus).toBe('cancelled')
    expect(result.result).toBeNull()
  })
})
