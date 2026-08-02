import { describe, expect, it } from 'vitest'
import { CONVERSATION_RULES } from './CONVERSATION_RULES'
import type { ConversationTrigger } from '../types'

const ALL_TRIGGERS: readonly ConversationTrigger[] = [
  'assessment-completed',
  'mind-passport-created',
  'journey-started',
  'exercise-completed',
  'journey-completed',
  'weak-performance',
  'high-performance',
  'long-inactivity',
  'daily-login',
  'milestone-achieved',
]

describe('CONVERSATION_RULES', () => {
  it('has exactly one rule per supported trigger', () => {
    expect(CONVERSATION_RULES.map((rule) => rule.trigger).sort()).toEqual([...ALL_TRIGGERS].sort())
  })

  it('has unique rule ids', () => {
    const ids = CONVERSATION_RULES.map((rule) => rule.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
