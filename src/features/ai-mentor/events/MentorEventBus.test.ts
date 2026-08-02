import { describe, expect, it, vi } from 'vitest'
import { MentorEventBus } from './MentorEventBus'
import { makeMentorSession } from '../testFixtures'
import type { MentorEvent } from '../types'

function sessionStartedEvent(overrides: Partial<MentorEvent<'session-started'>> = {}): MentorEvent<'session-started'> {
  return {
    id: 'event-1',
    type: 'session-started',
    occurredAt: '2026-01-01T00:00:00.000Z',
    payload: { session: makeMentorSession() },
    ...overrides,
  }
}

describe('MentorEventBus', () => {
  it('delivers an emitted event to a listener subscribed to that type', () => {
    const bus = new MentorEventBus()
    const listener = vi.fn()
    bus.on('session-started', listener)

    const event = sessionStartedEvent()
    bus.emit(event)

    expect(listener).toHaveBeenCalledExactlyOnceWith(event)
  })

  it('never delivers an event to a listener subscribed to a different type', () => {
    const bus = new MentorEventBus()
    const listener = vi.fn()
    bus.on('session-ended', listener)

    bus.emit(sessionStartedEvent())

    expect(listener).not.toHaveBeenCalled()
  })

  it('delivers to every listener subscribed to the same type', () => {
    const bus = new MentorEventBus()
    const first = vi.fn()
    const second = vi.fn()
    bus.on('session-started', first)
    bus.on('session-started', second)

    bus.emit(sessionStartedEvent())

    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
  })

  it('stops delivering events once unsubscribed', () => {
    const bus = new MentorEventBus()
    const listener = vi.fn()
    const unsubscribe = bus.on('session-started', listener)

    unsubscribe()
    bus.emit(sessionStartedEvent())

    expect(listener).not.toHaveBeenCalled()
  })

  it('does nothing when emitting with zero listeners', () => {
    const bus = new MentorEventBus()
    expect(() => bus.emit(sessionStartedEvent())).not.toThrow()
  })

  it('tracks listenerCount accurately across subscribe/unsubscribe', () => {
    const bus = new MentorEventBus()
    expect(bus.listenerCount('session-started')).toBe(0)

    const unsubscribe = bus.on('session-started', vi.fn())
    expect(bus.listenerCount('session-started')).toBe(1)

    unsubscribe()
    expect(bus.listenerCount('session-started')).toBe(0)
  })
})
