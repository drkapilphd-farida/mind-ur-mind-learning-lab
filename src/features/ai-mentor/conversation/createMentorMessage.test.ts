import { describe, expect, it } from 'vitest'
import { createMentorMessage } from './createMentorMessage'
import { makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'

describe('createMentorMessage', () => {
  it('uses the injected IdGenerator and Clock rather than a real one', () => {
    const message = createMentorMessage({ role: 'learner', content: 'Hi' }, makeSequentialIdGenerator('message'), makeFixedClock('2026-05-01T00:00:00.000Z'))
    expect(message).toEqual({ id: 'message-1', role: 'learner', content: 'Hi', createdAt: '2026-05-01T00:00:00.000Z' })
  })

  it('produces a different id for each call from the same generator', () => {
    const idGenerator = makeSequentialIdGenerator()
    const first = createMentorMessage({ role: 'learner', content: 'A' }, idGenerator, makeFixedClock())
    const second = createMentorMessage({ role: 'mentor', content: 'B' }, idGenerator, makeFixedClock())
    expect(first.id).not.toBe(second.id)
  })

  it('preserves the given role and content exactly', () => {
    const message = createMentorMessage({ role: 'mentor', content: 'Some reply' }, makeSequentialIdGenerator(), makeFixedClock())
    expect(message.role).toBe('mentor')
    expect(message.content).toBe('Some reply')
  })
})
