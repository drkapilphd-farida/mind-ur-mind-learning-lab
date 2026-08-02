import { describe, expect, it } from 'vitest'
import { createSessionStateMachine } from './DefaultSessionStateMachine'
import { IllegalSessionTransitionError } from './IllegalSessionTransitionError'
import type { SessionState } from '../types'

describe('DefaultSessionStateMachine (State Transitions)', () => {
  const machine = createSessionStateMachine()

  it('allows the full, linear happy-path sequence', () => {
    const sequence: SessionState[] = ['created', 'initialized', 'running', 'waiting-for-response', 'completed']

    for (let i = 0; i < sequence.length - 1; i += 1) {
      expect(machine.transition(sequence[i] as SessionState, sequence[i + 1] as SessionState)).toBe(sequence[i + 1])
    }
  })

  it('allows running/waiting-for-response to transition to failed', () => {
    expect(machine.transition('running', 'failed')).toBe('failed')
    expect(machine.transition('waiting-for-response', 'failed')).toBe('failed')
  })

  it('allows every non-terminal state to transition to cancelled', () => {
    const nonTerminal: SessionState[] = ['created', 'initialized', 'running', 'waiting-for-response']
    for (const state of nonTerminal) {
      expect(machine.transition(state, 'cancelled')).toBe('cancelled')
    }
  })

  it('rejects skipping a stage', () => {
    expect(() => machine.transition('created', 'running')).toThrow(IllegalSessionTransitionError)
  })

  it('rejects any transition out of a terminal state', () => {
    expect(() => machine.transition('completed', 'created')).toThrow(IllegalSessionTransitionError)
    expect(() => machine.transition('failed', 'created')).toThrow(IllegalSessionTransitionError)
    expect(() => machine.transition('cancelled', 'created')).toThrow(IllegalSessionTransitionError)
  })

  it('rejects created transitioning directly to failed (must go through running/waiting-for-response)', () => {
    expect(() => machine.transition('created', 'failed')).toThrow(IllegalSessionTransitionError)
  })
})
