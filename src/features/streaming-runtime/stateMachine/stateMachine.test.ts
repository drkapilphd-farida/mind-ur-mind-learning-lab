import { describe, expect, it } from 'vitest'
import type { StreamingState } from '../types'
import { createStreamingStateMachine } from './DefaultStreamingStateMachine'
import { IllegalStreamingTransitionError } from './IllegalStreamingTransitionError'

const ALL_STATES: readonly StreamingState[] = [
  'idle',
  'starting',
  'streaming',
  'paused',
  'completed',
  'cancelled',
  'failed',
]

const LEGAL_TRANSITIONS: ReadonlyArray<readonly [StreamingState, StreamingState]> = [
  ['idle', 'starting'],
  ['idle', 'cancelled'],
  ['starting', 'streaming'],
  ['starting', 'failed'],
  ['starting', 'cancelled'],
  ['streaming', 'paused'],
  ['streaming', 'completed'],
  ['streaming', 'failed'],
  ['streaming', 'cancelled'],
  ['paused', 'streaming'],
  ['paused', 'failed'],
  ['paused', 'cancelled'],
]

describe('DefaultStreamingStateMachine (State Transitions)', () => {
  it.each(LEGAL_TRANSITIONS)('allows %s -> %s', (from, to) => {
    const machine = createStreamingStateMachine()
    expect(machine.transition(from, to)).toBe(to)
  })

  it('Cancellation: cancelled is reachable from every non-terminal state', () => {
    const machine = createStreamingStateMachine()
    const nonTerminal: readonly StreamingState[] = ['idle', 'starting', 'streaming', 'paused']

    for (const from of nonTerminal) {
      expect(machine.transition(from, 'cancelled')).toBe('cancelled')
    }
  })

  it('Paused Reachability: streaming can enter and leave paused', () => {
    const machine = createStreamingStateMachine()

    expect(machine.transition('streaming', 'paused')).toBe('paused')
    expect(machine.transition('paused', 'streaming')).toBe('streaming')
  })

  it('rejects every transition out of a terminal state', () => {
    const machine = createStreamingStateMachine()
    const terminal: readonly StreamingState[] = ['completed', 'cancelled', 'failed']

    for (const from of terminal) {
      for (const to of ALL_STATES) {
        expect(() => machine.transition(from, to)).toThrow(IllegalStreamingTransitionError)
      }
    }
  })

  it('rejects skipping directly from idle to streaming', () => {
    const machine = createStreamingStateMachine()
    expect(() => machine.transition('idle', 'streaming')).toThrow(IllegalStreamingTransitionError)
  })

  it('rejects skipping directly from idle to completed', () => {
    const machine = createStreamingStateMachine()
    expect(() => machine.transition('idle', 'completed')).toThrow(IllegalStreamingTransitionError)
  })

  it('rejects paused directly to completed (must resume to streaming first)', () => {
    const machine = createStreamingStateMachine()
    expect(() => machine.transition('paused', 'completed')).toThrow(IllegalStreamingTransitionError)
  })

  it('the thrown error records the offending from/to pair', () => {
    const machine = createStreamingStateMachine()

    try {
      machine.transition('completed', 'streaming')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(IllegalStreamingTransitionError)
      expect((error as IllegalStreamingTransitionError).from).toBe('completed')
      expect((error as IllegalStreamingTransitionError).to).toBe('streaming')
    }
  })

  it('Determinism: two independently-constructed machines behave identically', () => {
    const machineA = createStreamingStateMachine()
    const machineB = createStreamingStateMachine()

    expect(machineA.transition('idle', 'starting')).toEqual(machineB.transition('idle', 'starting'))
  })
})
