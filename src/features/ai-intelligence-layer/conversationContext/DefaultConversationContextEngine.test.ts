import { describe, expect, it } from 'vitest'
import { createConversationContextEngine } from './DefaultConversationContextEngine'

describe('DefaultConversationContextEngine', () => {
  const engine = createConversationContextEngine()

  it('defaults every field for an empty input', () => {
    expect(engine.buildContext({})).toEqual({
      currentTopic: null,
      previousQuestions: [],
      conversationSummary: null,
      learningIntent: null,
      pendingTasks: [],
    })
  })

  it('passes through explicitly given fields', () => {
    const context = engine.buildContext({ currentTopic: 'reading speed', pendingTasks: ['finish exercise'] })
    expect(context.currentTopic).toBe('reading speed')
    expect(context.pendingTasks).toEqual(['finish exercise'])
  })
})
