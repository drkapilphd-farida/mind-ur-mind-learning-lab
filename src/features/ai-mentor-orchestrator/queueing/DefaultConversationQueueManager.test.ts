import { describe, expect, it } from 'vitest'
import { createConversationQueueManager } from './DefaultConversationQueueManager'
import { makeConversationState } from '../testFixtures'
import type { ConversationState } from '../types'

describe('DefaultConversationQueueManager', () => {
  const manager = createConversationQueueManager()

  it('enqueue appends without mutating the original array', () => {
    const original: readonly ConversationState[] = []
    const state = makeConversationState()
    const result = manager.enqueue(original, state)

    expect(original).toHaveLength(0)
    expect(result).toEqual([state])
  })

  it('dequeue returns null when there are no queued entries', () => {
    const result = manager.dequeue([makeConversationState({ lifecycle: 'running' })])
    expect(result.next).toBeNull()
  })

  it('dequeue picks the highest-priority queued entry (critical over background)', () => {
    const background = makeConversationState({ id: 'a', priority: 'background', lifecycle: 'queued' })
    const critical = makeConversationState({ id: 'b', priority: 'critical', lifecycle: 'queued' })
    const result = manager.dequeue([background, critical])
    expect(result.next?.id).toBe('b')
  })

  it('dequeue respects the full priority order: critical > high > medium > low > background', () => {
    const entries = [
      makeConversationState({ id: 'low', priority: 'low', lifecycle: 'queued' }),
      makeConversationState({ id: 'medium', priority: 'medium', lifecycle: 'queued' }),
      makeConversationState({ id: 'high', priority: 'high', lifecycle: 'queued' }),
    ]
    expect(manager.dequeue(entries).next?.id).toBe('high')
  })

  it('dequeue breaks ties by earliest createdAt', () => {
    const earlier = makeConversationState({ id: 'earlier', priority: 'high', createdAt: '2026-01-01T00:00:00.000Z', lifecycle: 'queued' })
    const later = makeConversationState({ id: 'later', priority: 'high', createdAt: '2026-01-02T00:00:00.000Z', lifecycle: 'queued' })
    expect(manager.dequeue([later, earlier]).next?.id).toBe('earlier')
  })

  it('dequeue removes the picked entry from `remaining` but leaves everything else', () => {
    const a = makeConversationState({ id: 'a', priority: 'high', lifecycle: 'queued' })
    const b = makeConversationState({ id: 'b', priority: 'low', lifecycle: 'running' })
    const result = manager.dequeue([a, b])
    expect(result.remaining).toEqual([b])
  })

  it('dequeue never considers a `ready` or `running` entry', () => {
    const result = manager.dequeue([makeConversationState({ lifecycle: 'ready' }), makeConversationState({ lifecycle: 'running' })])
    expect(result.next).toBeNull()
  })
})
