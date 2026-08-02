import { describe, expect, it } from 'vitest'
import { createMentorSession } from './createMentorSession'
import { makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'

describe('createMentorSession', () => {
  it('creates a session and conversation sharing the same startedAt/timestamps', () => {
    const { session, conversation } = createMentorSession('project-1', makeSequentialIdGenerator(), makeFixedClock('2026-06-01T00:00:00.000Z'))
    expect(session.startedAt).toBe('2026-06-01T00:00:00.000Z')
    expect(conversation.startedAt).toBe('2026-06-01T00:00:00.000Z')
    expect(conversation.updatedAt).toBe('2026-06-01T00:00:00.000Z')
  })

  it('starts the session as active with no endedAt', () => {
    const { session } = createMentorSession('project-1', makeSequentialIdGenerator(), makeFixedClock())
    expect(session.status).toBe('active')
    expect(session.endedAt).toBeNull()
  })

  it('starts the conversation with zero messages', () => {
    const { conversation } = createMentorSession('project-1', makeSequentialIdGenerator(), makeFixedClock())
    expect(conversation.messages).toEqual([])
  })

  it('gives the session and conversation different ids', () => {
    const { session, conversation } = createMentorSession('project-1', makeSequentialIdGenerator(), makeFixedClock())
    expect(session.id).not.toBe(conversation.id)
  })

  it('scopes both to the given learningProjectId', () => {
    const { session, conversation } = createMentorSession('project-xyz', makeSequentialIdGenerator(), makeFixedClock())
    expect(session.learningProjectId).toBe('project-xyz')
    expect(conversation.learningProjectId).toBe('project-xyz')
  })
})
