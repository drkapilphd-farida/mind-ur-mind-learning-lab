import { describe, expect, it } from 'vitest'
import { transitionExecutionState } from './transitionExecutionState'
import { IllegalExecutionTransitionError } from './IllegalExecutionTransitionError'

describe('transitionExecutionState', () => {
  it('allows the full success-path progression', () => {
    expect(transitionExecutionState('pending', 'preparing')).toBe('preparing')
    expect(transitionExecutionState('preparing', 'ready')).toBe('ready')
    expect(transitionExecutionState('ready', 'executing')).toBe('executing')
    expect(transitionExecutionState('executing', 'completed')).toBe('completed')
  })

  it('allows executing to fan out to failed, timeout, and retrying', () => {
    expect(transitionExecutionState('executing', 'failed')).toBe('failed')
    expect(transitionExecutionState('executing', 'timeout')).toBe('timeout')
    expect(transitionExecutionState('executing', 'retrying')).toBe('retrying')
  })

  it('allows retrying to loop back to executing for the next attempt', () => {
    expect(transitionExecutionState('retrying', 'executing')).toBe('executing')
  })

  it('allows cancellation from every non-terminal state', () => {
    for (const state of ['pending', 'preparing', 'ready', 'executing', 'retrying'] as const) {
      expect(transitionExecutionState(state, 'cancelled')).toBe('cancelled')
    }
  })

  it('throws IllegalExecutionTransitionError for a skipped stage', () => {
    expect(() => transitionExecutionState('pending', 'executing')).toThrow(IllegalExecutionTransitionError)
  })

  it('throws IllegalExecutionTransitionError for any transition out of a terminal state', () => {
    expect(() => transitionExecutionState('completed', 'executing')).toThrow(IllegalExecutionTransitionError)
    expect(() => transitionExecutionState('cancelled', 'pending')).toThrow(IllegalExecutionTransitionError)
    expect(() => transitionExecutionState('failed', 'retrying')).toThrow(IllegalExecutionTransitionError)
    expect(() => transitionExecutionState('timeout', 'executing')).toThrow(IllegalExecutionTransitionError)
  })
})
