import { describe, expect, it } from 'vitest'
import { createConversationMemoryBuilder } from './DefaultConversationMemoryBuilder'
import { makeConversationHistory, makeConversationTurn } from '../testFixtures'

describe('DefaultConversationMemoryBuilder', () => {
  const builder = createConversationMemoryBuilder()

  it('returns empty memory for an empty history', () => {
    expect(builder.build(makeConversationHistory([]))).toEqual({
      recentConversationTypes: [],
      totalMentorTurns: 0,
      lastConversationType: null,
    })
  })

  it('lastConversationType is the most recent mentor turn', () => {
    const history = makeConversationHistory([
      makeConversationTurn({ conversationType: 'welcome' }),
      makeConversationTurn({ conversationType: 'daily-motivation' }),
    ])
    expect(builder.build(history).lastConversationType).toBe('daily-motivation')
  })

  it('recentConversationTypes is most-recent-first', () => {
    const history = makeConversationHistory([
      makeConversationTurn({ conversationType: 'welcome' }),
      makeConversationTurn({ conversationType: 'daily-motivation' }),
      makeConversationTurn({ conversationType: 'progress-celebration' }),
    ])
    expect(builder.build(history).recentConversationTypes).toEqual(['progress-celebration', 'daily-motivation', 'welcome'])
  })

  it('caps recentConversationTypes at 5 entries', () => {
    const turns = Array.from({ length: 8 }, (_, index) => makeConversationTurn({ conversationType: 'welcome', id: `turn-${index}` }))
    const memory = builder.build(makeConversationHistory(turns))
    expect(memory.recentConversationTypes).toHaveLength(5)
  })

  it('ignores learner turns when counting mentor turns', () => {
    const history = makeConversationHistory([
      makeConversationTurn({ role: 'mentor', conversationType: 'welcome' }),
      makeConversationTurn({ role: 'learner', conversationType: null }),
    ])
    expect(builder.build(history).totalMentorTurns).toBe(1)
  })
})
