import { describe, expect, it } from 'vitest'
import { createConversationLifecycleManager } from './DefaultConversationLifecycleManager'
import { IllegalLifecycleTransitionError } from '../errors'
import { makeConversationState } from '../testFixtures'

describe('DefaultConversationLifecycleManager', () => {
  const manager = createConversationLifecycleManager()

  it('walks the full happy path: queued -> ready -> running -> completed', () => {
    const queued = makeConversationState({ lifecycle: 'queued' })
    const ready = manager.markReady(queued)
    expect(ready.lifecycle).toBe('ready')
    const running = manager.markRunning(ready)
    expect(running.lifecycle).toBe('running')
    const completed = manager.markCompleted(running)
    expect(completed.lifecycle).toBe('completed')
  })

  it('supports running -> waiting -> running (resume)', () => {
    const running = makeConversationState({ lifecycle: 'running' })
    const waiting = manager.markWaiting(running)
    expect(waiting.lifecycle).toBe('waiting')
    const resumed = manager.resume(waiting)
    expect(resumed.lifecycle).toBe('running')
  })

  it('allows dismissing from queued, ready, or waiting', () => {
    for (const lifecycle of ['queued', 'ready', 'waiting'] as const) {
      const state = makeConversationState({ lifecycle })
      expect(manager.markDismissed(state).lifecycle).toBe('dismissed')
    }
  })

  it('rejects markRunning from queued (must go through ready first)', () => {
    const queued = makeConversationState({ lifecycle: 'queued' })
    expect(() => manager.markRunning(queued)).toThrow(IllegalLifecycleTransitionError)
  })

  it('rejects markCompleted from a terminal state', () => {
    const completed = makeConversationState({ lifecycle: 'completed' })
    expect(() => manager.markCompleted(completed)).toThrow(IllegalLifecycleTransitionError)
  })

  it('rejects resume from a non-waiting state', () => {
    const running = makeConversationState({ lifecycle: 'running' })
    expect(() => manager.resume(running)).toThrow(IllegalLifecycleTransitionError)
  })

  it('never mutates the given state — returns a new object', () => {
    const queued = makeConversationState({ lifecycle: 'queued' })
    const ready = manager.markReady(queued)
    expect(queued.lifecycle).toBe('queued')
    expect(ready).not.toBe(queued)
  })

  describe('expireIfStale', () => {
    it('expires a queued conversation whose expiresAt has passed', () => {
      const state = makeConversationState({ lifecycle: 'queued', expiresAt: '2026-01-01T00:00:00.000Z' })
      const result = manager.expireIfStale(state, '2026-01-02T00:00:00.000Z')
      expect(result.lifecycle).toBe('expired')
    })

    it('does not expire a conversation whose expiresAt has not yet passed', () => {
      const state = makeConversationState({ lifecycle: 'queued', expiresAt: '2026-01-05T00:00:00.000Z' })
      const result = manager.expireIfStale(state, '2026-01-02T00:00:00.000Z')
      expect(result.lifecycle).toBe('queued')
    })

    it('never expires an already-terminal conversation', () => {
      const state = makeConversationState({ lifecycle: 'completed', expiresAt: '2020-01-01T00:00:00.000Z' })
      const result = manager.expireIfStale(state, '2026-01-02T00:00:00.000Z')
      expect(result.lifecycle).toBe('completed')
    })

    it('does not throw for a state with no expiresAt', () => {
      const state = makeConversationState({ lifecycle: 'running', expiresAt: null })
      expect(() => manager.expireIfStale(state, '2026-01-02T00:00:00.000Z')).not.toThrow()
    })
  })
})
