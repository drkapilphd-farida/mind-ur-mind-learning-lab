import { describe, expect, it } from 'vitest'
import { CONVERSATION_TEMPLATES } from './CONVERSATION_TEMPLATES'
import type { ConversationType } from '../types'
import { makeConversationContext } from '../testFixtures'

const ALL_TYPES: readonly ConversationType[] = [
  'welcome',
  'daily-motivation',
  'learning-plan-explanation',
  'exercise-recommendation',
  'study-reminder',
  'progress-celebration',
  'weakness-coaching',
  'milestone-conversation',
  'journey-guidance',
  'next-session-suggestion',
]

describe('CONVERSATION_TEMPLATES', () => {
  it('has exactly one template for each of the 10 conversation types', () => {
    expect(Object.keys(CONVERSATION_TEMPLATES).sort()).toEqual([...ALL_TYPES].sort())
  })

  it('every template produces a non-empty title and mainResponse, even with an entirely empty context', () => {
    for (const type of ALL_TYPES) {
      const output = CONVERSATION_TEMPLATES[type](makeConversationContext({ conversationType: type }))
      expect(output.title.length).toBeGreaterThan(0)
      expect(output.mainResponse.length).toBeGreaterThan(0)
    }
  })

  it('welcome mentions the learner name', () => {
    const output = CONVERSATION_TEMPLATES.welcome(makeConversationContext({ learnerName: 'Zara' }))
    expect(output.mainResponse).toContain('Zara')
  })

  it('progress-celebration references progressPercent when present, never a fabricated one', () => {
    const withProgress = CONVERSATION_TEMPLATES['progress-celebration'](makeConversationContext({ progressPercent: 42 }))
    expect(withProgress.mainResponse).toContain('42%')

    const withoutProgress = CONVERSATION_TEMPLATES['progress-celebration'](makeConversationContext({ progressPercent: null }))
    expect(withoutProgress.mainResponse).not.toMatch(/\d+%/)
  })

  it('exercise-recommendation has no suggested action when recommendedExercise is null', () => {
    const output = CONVERSATION_TEMPLATES['exercise-recommendation'](makeConversationContext({ recommendedExercise: null }))
    expect(output.suggestedActions).toEqual([])
  })

  it('exercise-recommendation suggests the exercise when present', () => {
    const output = CONVERSATION_TEMPLATES['exercise-recommendation'](makeConversationContext({ recommendedExercise: 'reading-speed-drill' }))
    expect(output.mainResponse).toContain('reading-speed-drill')
    expect(output.suggestedActions).toContain('Start reading-speed-drill')
  })

  it('milestone-conversation references currentMilestone when present', () => {
    const output = CONVERSATION_TEMPLATES['milestone-conversation'](makeConversationContext({ currentMilestone: 'Reach 50% completion' }))
    expect(output.mainResponse).toContain('Reach 50% completion')
  })

  it('daily-motivation references streak when present, never inventing one', () => {
    const withStreak = CONVERSATION_TEMPLATES['daily-motivation'](makeConversationContext({ streak: 7 }))
    expect(withStreak.mainResponse).toContain('7-day streak')

    const withoutStreak = CONVERSATION_TEMPLATES['daily-motivation'](makeConversationContext({ streak: null }))
    expect(withoutStreak.mainResponse).not.toMatch(/\d+-day streak/)
  })

  it('is deterministic — the same context always produces the same output', () => {
    const context = makeConversationContext({ conversationType: 'journey-guidance', focusSkill: 'focus' })
    expect(CONVERSATION_TEMPLATES['journey-guidance'](context)).toEqual(CONVERSATION_TEMPLATES['journey-guidance'](context))
  })
})
