import { describe, expect, it } from 'vitest'
import { createRuntimeLifecycleManager } from './DefaultRuntimeLifecycleManager'
import { IllegalRuntimeStateTransitionError } from './IllegalRuntimeStateTransitionError'
import type { RuntimeState } from '../types'

describe('DefaultRuntimeLifecycleManager (Lifecycle Transitions / State Management)', () => {
  const manager = createRuntimeLifecycleManager()

  it('allows the full, linear happy-path sequence', () => {
    const sequence: RuntimeState[] = [
      'pending',
      'personalization-ready',
      'recommendation-ready',
      'mentor-ready',
      'provider-selected',
      'model-selected',
      'request-ready',
      'adapter-processed',
      'response-ready',
      'completed',
    ]

    for (let i = 0; i < sequence.length - 1; i += 1) {
      expect(manager.transition(sequence[i] as RuntimeState, sequence[i + 1] as RuntimeState)).toBe(sequence[i + 1])
    }
  })

  it('allows transitioning to failed from every non-terminal state', () => {
    const nonTerminal: RuntimeState[] = [
      'pending',
      'personalization-ready',
      'recommendation-ready',
      'mentor-ready',
      'provider-selected',
      'model-selected',
      'request-ready',
      'adapter-processed',
      'response-ready',
    ]

    for (const state of nonTerminal) {
      expect(manager.transition(state, 'failed')).toBe('failed')
    }
  })

  it('rejects skipping a stage', () => {
    expect(() => manager.transition('pending', 'mentor-ready')).toThrow(IllegalRuntimeStateTransitionError)
  })

  it('rejects any transition out of a terminal state', () => {
    expect(() => manager.transition('completed', 'pending')).toThrow(IllegalRuntimeStateTransitionError)
    expect(() => manager.transition('failed', 'pending')).toThrow(IllegalRuntimeStateTransitionError)
  })
})
