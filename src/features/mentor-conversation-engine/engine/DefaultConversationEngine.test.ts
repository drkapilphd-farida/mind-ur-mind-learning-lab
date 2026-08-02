import { describe, expect, it, vi } from 'vitest'
import { createConversationEngine } from './DefaultConversationEngine'
import { makeConversationContext, makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'
import type { ConversationEngine, PromptComposer } from '../contracts'

describe('DefaultConversationEngine (end-to-end, real default dependencies)', () => {
  it('startSession produces an empty session with a fresh id', () => {
    const engine = createConversationEngine({ idGenerator: makeSequentialIdGenerator('session'), clock: makeFixedClock() })
    const session = engine.startSession('learner-1')

    expect(session.id).toBe('session-1')
    expect(session.learnerId).toBe('learner-1')
    expect(session.history.turns).toEqual([])
    expect(session.memory.totalMentorTurns).toBe(0)
  })

  it('respond() returns a new session — the original is never mutated', async () => {
    const engine = createConversationEngine()
    const original = engine.startSession('learner-1')
    const originalTurnsRef = original.history.turns

    const { session: updated } = await engine.respond(original, makeConversationContext())

    expect(original.history.turns).toBe(originalTurnsRef)
    expect(original.history.turns).toHaveLength(0)
    expect(updated.history.turns).toHaveLength(1)
  })

  it('supports multi-turn conversations — memory accumulates across calls', async () => {
    const engine = createConversationEngine()
    let session = engine.startSession('learner-1')

    const first = await engine.respond(session, makeConversationContext({ conversationType: 'welcome' }))
    session = first.session
    expect(session.memory.totalMentorTurns).toBe(1)
    expect(session.memory.lastConversationType).toBe('welcome')

    const second = await engine.respond(session, makeConversationContext({ conversationType: 'daily-motivation' }))
    session = second.session
    expect(session.memory.totalMentorTurns).toBe(2)
    expect(session.memory.lastConversationType).toBe('daily-motivation')
    expect(session.memory.recentConversationTypes).toEqual(['daily-motivation', 'welcome'])
  })

  it('appends exactly one new mentor turn per respond() call, containing the response mainResponse', async () => {
    const engine = createConversationEngine()
    const session = engine.startSession('learner-1')
    const { session: updated, response } = await engine.respond(session, makeConversationContext({ conversationType: 'welcome', learnerName: 'Ada' }))

    expect(updated.history.turns).toHaveLength(1)
    expect(updated.history.turns[0]).toMatchObject({ role: 'mentor', content: response.mainResponse, conversationType: 'welcome' })
  })

  it('is fully dependency-injected — an overridden PromptComposer is actually used', async () => {
    const composeSpy = vi.fn(() => ({ systemPrompt: 'stub', tone: 'neutral' as const, contextSummary: 'stub' }))
    const stubComposer: PromptComposer = { compose: composeSpy }

    const engine = createConversationEngine({ promptComposer: stubComposer })
    const session = engine.startSession('learner-1')
    await engine.respond(session, makeConversationContext())

    expect(composeSpy).toHaveBeenCalledTimes(1)
  })

  it('is deterministic end-to-end with fixed Clock/IdGenerator', async () => {
    const buildEngine = (): ConversationEngine => createConversationEngine({ clock: makeFixedClock(), idGenerator: makeSequentialIdGenerator('turn') })

    const engineA = buildEngine()
    const sessionA = engineA.startSession('learner-1')
    const resultA = await engineA.respond(sessionA, makeConversationContext({ conversationType: 'welcome' }))

    const engineB = buildEngine()
    const sessionB = engineB.startSession('learner-1')
    const resultB = await engineB.respond(sessionB, makeConversationContext({ conversationType: 'welcome' }))

    expect(resultA.response).toEqual(resultB.response)
  })
})
