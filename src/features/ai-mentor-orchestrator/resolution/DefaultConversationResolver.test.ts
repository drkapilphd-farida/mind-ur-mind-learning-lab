import { describe, expect, it } from 'vitest'
import { createConversationResolver } from './DefaultConversationResolver'
import { UnknownTriggerError } from '../errors'
import { CONVERSATION_RULES } from '../rules'
import { makeTriggerEvent } from '../testFixtures'
import type { ConversationTrigger } from '../types'

describe('DefaultConversationResolver', () => {
  const resolver = createConversationResolver()

  it('resolves every one of the 10 supported triggers to a rule', () => {
    const triggers: readonly ConversationTrigger[] = CONVERSATION_RULES.map((rule) => rule.trigger)
    for (const trigger of triggers) {
      expect(() => resolver.resolve(makeTriggerEvent({ trigger }))).not.toThrow()
    }
  })

  it('resolves mind-passport-created to a welcome conversation at critical priority', () => {
    const rule = resolver.resolve(makeTriggerEvent({ trigger: 'mind-passport-created' }))
    expect(rule.conversationType).toBe('welcome')
    expect(rule.priority).toBe('critical')
  })

  it('resolves exercise-completed to next-session-suggestion at background priority', () => {
    const rule = resolver.resolve(makeTriggerEvent({ trigger: 'exercise-completed' }))
    expect(rule.conversationType).toBe('next-session-suggestion')
    expect(rule.priority).toBe('background')
  })

  it('is deterministic — the same trigger always resolves to the same rule', () => {
    const event = makeTriggerEvent({ trigger: 'weak-performance' })
    expect(resolver.resolve(event)).toEqual(resolver.resolve(event))
  })

  it('throws UnknownTriggerError for an unrecognized trigger', () => {
    const event = makeTriggerEvent({ trigger: 'not-a-real-trigger' as ConversationTrigger })
    expect(() => resolver.resolve(event)).toThrow(UnknownTriggerError)
  })
})
