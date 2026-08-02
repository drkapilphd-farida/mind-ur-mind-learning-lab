import { describe, expect, it } from 'vitest'
import { createConversationDispatcher } from './DefaultConversationDispatcher'
import { makeConversationState, makeSequentialIdGenerator, makeTriggerEvent } from '../testFixtures'

describe('DefaultConversationDispatcher', () => {
  it('dispatches a new queued ConversationState for a fresh trigger', () => {
    const dispatcher = createConversationDispatcher({ idGenerator: makeSequentialIdGenerator('state') })
    const result = dispatcher.dispatch(makeTriggerEvent({ trigger: 'daily-login', learnerId: 'learner-1' }), [])

    expect(result.dispatchedState).not.toBeNull()
    expect(result.dispatchedState?.lifecycle).toBe('queued')
    expect(result.dispatchedState?.conversationType).toBe('daily-motivation')
    expect(result.queue).toHaveLength(1)
  })

  it('sets expiresAt based on the rule priority', () => {
    const dispatcher = createConversationDispatcher()
    const result = dispatcher.dispatch(makeTriggerEvent({ trigger: 'mind-passport-created', occurredAt: '2026-01-01T00:00:00.000Z' }), [])
    // mind-passport-created -> critical -> 24h TTL
    expect(result.dispatchedState?.expiresAt).toBe('2026-01-02T00:00:00.000Z')
  })

  it('deduplicates when an active conversation of the same type already exists for the learner', () => {
    const dispatcher = createConversationDispatcher()
    const existing = makeConversationState({ learnerId: 'learner-1', conversationType: 'daily-motivation', lifecycle: 'queued' })

    const result = dispatcher.dispatch(makeTriggerEvent({ trigger: 'daily-login', learnerId: 'learner-1' }), [existing])

    expect(result.dispatchedState).toBeNull()
    expect(result.queue).toEqual([existing])
    expect(result.reason).toContain('deduplicated')
  })

  it('does not deduplicate a different learner’s conversation of the same type', () => {
    const dispatcher = createConversationDispatcher()
    const existing = makeConversationState({ learnerId: 'learner-2', conversationType: 'daily-motivation', lifecycle: 'queued' })

    const result = dispatcher.dispatch(makeTriggerEvent({ trigger: 'daily-login', learnerId: 'learner-1' }), [existing])

    expect(result.dispatchedState).not.toBeNull()
  })

  it('does not deduplicate against a completed conversation — a new one can be dispatched', () => {
    const dispatcher = createConversationDispatcher()
    const completed = makeConversationState({ learnerId: 'learner-1', conversationType: 'daily-motivation', lifecycle: 'completed' })

    const result = dispatcher.dispatch(makeTriggerEvent({ trigger: 'daily-login', learnerId: 'learner-1' }), [completed])

    expect(result.dispatchedState).not.toBeNull()
  })

  it('does not deduplicate against an expired conversation', () => {
    const dispatcher = createConversationDispatcher()
    const expired = makeConversationState({ learnerId: 'learner-1', conversationType: 'daily-motivation', lifecycle: 'expired' })

    const result = dispatcher.dispatch(makeTriggerEvent({ trigger: 'daily-login', learnerId: 'learner-1' }), [expired])

    expect(result.dispatchedState).not.toBeNull()
  })

  it('carries the given TriggerEvent context through to the dispatched state', () => {
    const dispatcher = createConversationDispatcher()
    const context = { learnerName: 'Zara', conversationType: 'welcome' as const, focusSkill: 'reading', currentMilestone: null, recommendedExercise: null, progressPercent: null, streak: null }
    const result = dispatcher.dispatch(makeTriggerEvent({ trigger: 'mind-passport-created', context }), [])
    expect(result.dispatchedState?.context).toEqual(context)
  })
})
