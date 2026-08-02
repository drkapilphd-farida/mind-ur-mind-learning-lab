import { describe, expect, it } from 'vitest'
import { createAIExecutionSessionManager } from '../manager'
import type { SessionStateMachine } from '../stateMachine'
import { IllegalSessionTransitionError } from '../stateMachine'
import { createSessionLifecycleCoordinator } from './DefaultSessionLifecycleCoordinator'
import { makeFixedClock, makeSessionRunInputs } from '../testFixtures'

const alwaysThrowingStateMachine: SessionStateMachine = {
  transition: (from, to) => {
    throw new IllegalSessionTransitionError(from, to)
  },
}

describe('DefaultSessionLifecycleCoordinator', () => {
  it('Session Initialization / State Transitions / Success Flow: a well-formed run reaches completed', () => {
    const coordinator = createSessionLifecycleCoordinator({ clock: makeFixedClock('2026-01-01T00:00:00.000Z') })

    const result = coordinator.run(makeSessionRunInputs())

    expect(result.completionStatus).toBe('completed')
    expect(result.session.state).toBe('completed')
    expect(result.result).toEqual({ responseText: 'Fractions represent parts of a whole.', providerId: 'openai', modelId: 'gpt-4o' })
    expect(result.session.eventLog.events.map((event) => event.state)).toEqual(['created', 'initialized', 'running', 'waiting-for-response', 'completed'])
  })

  it('Session Lifecycle Integrity: two coordinators produce the same result for the same inputs', () => {
    const coordinatorA = createSessionLifecycleCoordinator({ clock: makeFixedClock('2026-01-01T00:00:00.000Z') })
    const coordinatorB = createSessionLifecycleCoordinator({ clock: makeFixedClock('2026-01-01T00:00:00.000Z') })
    const inputs = makeSessionRunInputs()

    expect(coordinatorA.run(inputs)).toEqual(coordinatorB.run(inputs))
  })

  it('Failure Flow: a legitimate failure outcome completes as failed with the given reason', () => {
    const coordinator = createSessionLifecycleCoordinator()

    const result = coordinator.run(makeSessionRunInputs({ outcome: { succeeded: false, responseText: null, failureReason: 'The provider timed out.' } }))

    expect(result.completionStatus).toBe('failed')
    expect(result.session.state).toBe('failed')
    expect(result.result).toBeNull()
    expect(result.failureReason).toBe('The provider timed out.')
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
  })

  it('Cancellation: a cancellation request short-circuits before any request/response tracking', () => {
    const coordinator = createSessionLifecycleCoordinator()

    const result = coordinator.run(makeSessionRunInputs({ cancellationRequested: true }))

    expect(result.completionStatus).toBe('cancelled')
    expect(result.session.state).toBe('cancelled')
    expect(result.session.eventLog.events.map((event) => event.state)).toEqual(['created', 'cancelled'])
  })

  it('rejects a missing runtime context before any registration', () => {
    const coordinator = createSessionLifecycleCoordinator()

    const result = coordinator.run(makeSessionRunInputs({ context: { learnerId: '', profileId: 'profile-1', providerId: null, modelId: null } }))

    expect(result.completionStatus).toBe('failed')
    expect(result.validationResult.issues.some((issue) => issue.type === 'missing-runtime-context')).toBe(true)
  })

  it('rejects a duplicate session id on a second run with the same id', () => {
    const coordinator = createSessionLifecycleCoordinator()
    const inputs = makeSessionRunInputs({ sessionId: 'session-1' })

    coordinator.run(inputs)
    const result = coordinator.run(inputs)

    expect(result.completionStatus).toBe('failed')
    expect(result.validationResult.issues.some((issue) => issue.type === 'duplicate-session-id')).toBe(true)
  })

  it('rejects a malformed success outcome (missing response)', () => {
    const coordinator = createSessionLifecycleCoordinator()

    const result = coordinator.run(makeSessionRunInputs({ outcome: { succeeded: true, responseText: null, failureReason: null } }))

    expect(result.completionStatus).toBe('failed')
    expect(result.validationResult.issues.some((issue) => issue.type === 'missing-execution-result')).toBe(true)
  })

  it('rejects a malformed failure outcome (unexpected failure with no reason)', () => {
    const coordinator = createSessionLifecycleCoordinator()

    const result = coordinator.run(makeSessionRunInputs({ outcome: { succeeded: false, responseText: null, failureReason: '' } }))

    expect(result.completionStatus).toBe('failed')
    expect(result.validationResult.issues.some((issue) => issue.type === 'unexpected-failure')).toBe(true)
  })

  it('Metadata Integrity: the session manager reflects the final, post-run state, not the initial "created" snapshot', () => {
    const sessionManager = createAIExecutionSessionManager()
    const coordinator = createSessionLifecycleCoordinator({ sessionManager })

    const result = coordinator.run(makeSessionRunInputs({ sessionId: 'session-1' }))

    expect(result.session.state).toBe('completed')
    expect(sessionManager.get('session-1')?.state).toBe('completed')
    expect(sessionManager.get('session-1')?.eventLog.events).toHaveLength(5)
  })

  it('catches an illegal state transition defensively', () => {
    const coordinator = createSessionLifecycleCoordinator({ stateMachine: alwaysThrowingStateMachine })

    const result = coordinator.run(makeSessionRunInputs())

    expect(result.completionStatus).toBe('failed')
    expect(result.validationResult.issues.some((issue) => issue.type === 'invalid-transition')).toBe(true)
  })
})
