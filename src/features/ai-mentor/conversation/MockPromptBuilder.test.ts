import { describe, expect, it } from 'vitest'
import { MockPromptBuilder } from './MockPromptBuilder'
import { makeMentorMessage, makeMentorRecommendation } from '../testFixtures'
import type { MentorContext } from '../types'

function makeContext(overrides: Partial<MentorContext> = {}): MentorContext {
  return {
    learningProjectId: 'project-1',
    recentMessages: [],
    insights: [],
    recommendations: [],
    memory: [],
    ...overrides,
  }
}

describe('MockPromptBuilder', () => {
  it('always leads with a system message', () => {
    const builder = new MockPromptBuilder()
    const prompt = builder.build(makeContext())
    expect(prompt.messages[0]?.role).toBe('system')
  })

  it('translates conversation messages into generic role-tagged prompt messages, preserving order', () => {
    const builder = new MockPromptBuilder()
    const recentMessages = [makeMentorMessage({ role: 'learner', content: 'Question' }), makeMentorMessage({ role: 'mentor', content: 'Answer' })]
    const prompt = builder.build(makeContext({ recentMessages }))

    expect(prompt.messages.slice(1)).toEqual([
      { role: 'learner', content: 'Question' },
      { role: 'mentor', content: 'Answer' },
    ])
  })

  it('mentions real recommendation titles in the system message when present', () => {
    const builder = new MockPromptBuilder()
    const prompt = builder.build(makeContext({ recommendations: [makeMentorRecommendation({ title: 'Try flashcards' })] }))
    expect(prompt.messages[0]?.content).toContain('Try flashcards')
  })

  it('mentions real memory facts in the system message when present', () => {
    const builder = new MockPromptBuilder()
    const prompt = builder.build(makeContext({ memory: ['Prefers short sessions'] }))
    expect(prompt.messages[0]?.content).toContain('Prefers short sessions')
  })

  it('never uses a provider-specific role name — only system/mentor/learner', () => {
    const builder = new MockPromptBuilder()
    const prompt = builder.build(makeContext({ recentMessages: [makeMentorMessage({ role: 'mentor' })] }))
    for (const message of prompt.messages) {
      expect(['system', 'mentor', 'learner']).toContain(message.role)
    }
  })
})
