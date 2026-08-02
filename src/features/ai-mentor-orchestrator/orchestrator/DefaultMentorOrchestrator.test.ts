import { describe, expect, it, vi } from 'vitest'
import { createMentorOrchestrator } from './DefaultMentorOrchestrator'
import { createConversationEngine } from '@/features/mentor-conversation-engine'
import { makeConversationState, makeTriggerEvent } from '../testFixtures'
import type { ConversationDispatcher } from '../contracts'

describe('DefaultMentorOrchestrator (end-to-end, real default dependencies)', () => {
  it('handleTrigger dispatches a new conversation for a fresh trigger', () => {
    const orchestrator = createMentorOrchestrator()
    const result = orchestrator.handleTrigger(makeTriggerEvent({ trigger: 'daily-login' }), [])
    expect(result.dispatchedState?.lifecycle).toBe('queued')
    expect(result.queue).toHaveLength(1)
  })

  it('processNext returns a null outcome when the queue has nothing runnable', async () => {
    const orchestrator = createMentorOrchestrator()
    const session = createConversationEngine().startSession('learner-1')
    const result = await orchestrator.processNext([], session)
    expect(result.outcome).toBeNull()
    expect(result.session).toBe(session)
  })

  it('processNext runs the highest-priority queued conversation through the real Sprint 10 ConversationEngine', async () => {
    const orchestrator = createMentorOrchestrator()
    const conversationEngine = createConversationEngine()
    const session = conversationEngine.startSession('learner-1')

    const queue = [
      makeConversationState({ id: 'low', priority: 'low', conversationType: 'daily-motivation', lifecycle: 'queued' }),
      makeConversationState({ id: 'critical', priority: 'critical', conversationType: 'welcome', lifecycle: 'queued' }),
    ]

    const result = await orchestrator.processNext(queue, session)

    expect(result.outcome?.state.id).toBe('critical')
    expect(result.outcome?.state.lifecycle).toBe('completed')
    expect(result.outcome?.response?.title.length).toBeGreaterThan(0)
    expect(result.queue.map((state) => state.id)).toEqual(['low'])
  })

  it('processNext updates the conversation session — the response is recorded in history', async () => {
    const orchestrator = createMentorOrchestrator()
    const conversationEngine = createConversationEngine()
    const session = conversationEngine.startSession('learner-1')
    const queue = [makeConversationState({ lifecycle: 'queued' })]

    const result = await orchestrator.processNext(queue, session)

    expect(result.session.history.turns).toHaveLength(1)
    expect(result.session.history.turns[0]?.role).toBe('mentor')
  })

  it('expireStale expires only conversations past their expiresAt', () => {
    const orchestrator = createMentorOrchestrator()
    const fresh = makeConversationState({ id: 'fresh', lifecycle: 'queued', expiresAt: '2026-06-01T00:00:00.000Z' })
    const stale = makeConversationState({ id: 'stale', lifecycle: 'queued', expiresAt: '2026-01-01T00:00:00.000Z' })

    const result = orchestrator.expireStale([fresh, stale], '2026-02-01T00:00:00.000Z')

    expect(result.find((state) => state.id === 'fresh')?.lifecycle).toBe('queued')
    expect(result.find((state) => state.id === 'stale')?.lifecycle).toBe('expired')
  })

  it('is fully dependency-injected — an overridden dispatcher is actually used', () => {
    const dispatchSpy = vi.fn(() => ({ queue: [], dispatchedState: null, reason: 'stubbed' }))
    const stubDispatcher: ConversationDispatcher = { dispatch: dispatchSpy }

    const orchestrator = createMentorOrchestrator({ dispatcher: stubDispatcher })
    orchestrator.handleTrigger(makeTriggerEvent(), [])

    expect(dispatchSpy).toHaveBeenCalledTimes(1)
  })

  it('a full realistic flow: handleTrigger dispatches, then processNext runs it through Sprint 10', async () => {
    const orchestrator = createMentorOrchestrator()
    const conversationEngine = createConversationEngine()
    const session = conversationEngine.startSession('learner-1')

    const dispatchResult = orchestrator.handleTrigger(makeTriggerEvent({ trigger: 'mind-passport-created', learnerId: 'learner-1' }), [])
    expect(dispatchResult.dispatchedState?.conversationType).toBe('welcome')

    const processResult = await orchestrator.processNext(dispatchResult.queue, session)
    expect(processResult.outcome?.state.conversationType).toBe('welcome')
    expect(processResult.outcome?.state.lifecycle).toBe('completed')
    expect(processResult.queue).toHaveLength(0)
  })
})
