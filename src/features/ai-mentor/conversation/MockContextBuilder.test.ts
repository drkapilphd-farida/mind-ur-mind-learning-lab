import { describe, expect, it } from 'vitest'
import { MockContextBuilder } from './MockContextBuilder'
import { makeConversation, makeMentorMessage, makeMentorRecommendation } from '../testFixtures'
import type { MentorInsight } from '../types'

describe('MockContextBuilder', () => {
  it('returns an empty recentMessages list when there is no conversation', async () => {
    const builder = new MockContextBuilder()
    const context = await builder.build({ learningProjectId: 'project-1', conversation: null, insights: [], recommendations: [], memory: [] })
    expect(context.recentMessages).toEqual([])
  })

  it('carries the conversation’s real messages through', async () => {
    const builder = new MockContextBuilder()
    const messages = [makeMentorMessage({ id: 'm1' }), makeMentorMessage({ id: 'm2' })]
    const context = await builder.build({ learningProjectId: 'project-1', conversation: makeConversation({ messages }), insights: [], recommendations: [], memory: [] })
    expect(context.recentMessages).toEqual(messages)
  })

  it('windows to only the last 10 messages', async () => {
    const builder = new MockContextBuilder()
    const messages = Array.from({ length: 15 }, (_, index) => makeMentorMessage({ id: `m${index}` }))
    const context = await builder.build({ learningProjectId: 'project-1', conversation: makeConversation({ messages }), insights: [], recommendations: [], memory: [] })
    expect(context.recentMessages).toHaveLength(10)
    expect(context.recentMessages[0]?.id).toBe('m5')
  })

  it('carries insights, recommendations, and memory through unchanged', async () => {
    const builder = new MockContextBuilder()
    const insights: readonly MentorInsight[] = [{ id: 'i1', type: 'progress', summary: 's', detail: 'd' }]
    const recommendations = [makeMentorRecommendation()]
    const memory = ['A remembered fact']

    const context = await builder.build({ learningProjectId: 'project-1', conversation: null, insights, recommendations, memory })

    expect(context.insights).toEqual(insights)
    expect(context.recommendations).toEqual(recommendations)
    expect(context.memory).toEqual(memory)
  })
})
