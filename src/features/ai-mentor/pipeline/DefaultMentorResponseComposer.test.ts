import { describe, expect, it } from 'vitest'
import { DefaultMentorResponseComposer } from './DefaultMentorResponseComposer'
import { makeMentorMessage, makeMentorRecommendation } from '../testFixtures'
import type { MentorContext, MentorInsight } from '../types'

describe('DefaultMentorResponseComposer', () => {
  it('repackages the context’s real insights/recommendations, never recomputing them', () => {
    const insights: readonly MentorInsight[] = [{ id: 'i1', type: 'progress', summary: 's', detail: 'd' }]
    const recommendations = [makeMentorRecommendation()]
    const context: MentorContext = { learningProjectId: 'project-1', recentMessages: [], insights, recommendations, memory: [] }
    const reply = makeMentorMessage({ role: 'mentor', content: 'A reply' })

    const composer = new DefaultMentorResponseComposer()
    const response = composer.compose({ conversationId: 'conversation-1', context, reply })

    expect(response).toEqual({
      conversationId: 'conversation-1',
      learningProjectId: 'project-1',
      reply,
      insights,
      recommendations,
    })
  })
})
