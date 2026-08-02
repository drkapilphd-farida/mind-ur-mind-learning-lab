import { describe, expect, it, vi } from 'vitest'
import { createMentorPipeline } from './createMentorPipeline'
import { makeConversation, makeFixedClock, makeLearningPlan, makeSequentialIdGenerator } from '../testFixtures'

describe('createMentorPipeline — real mock pipeline (integration)', () => {
  it('produces a complete MentorUIResponse end to end', async () => {
    const pipeline = createMentorPipeline()
    const response = await pipeline.run({
      learningProjectId: 'project-1',
      plan: makeLearningPlan(),
      conversation: makeConversation({ messages: [{ id: 'm1', role: 'learner', content: 'Hi', createdAt: '2026-01-01T00:00:00.000Z' }] }),
      memory: [],
    })

    expect(response.conversationId).toBe('conversation-1')
    expect(response.learningProjectId).toBe('project-1')
    expect(response.reply.role).toBe('mentor')
    expect(response.reply.content.length).toBeGreaterThan(0)
    expect(response.insights.length).toBeGreaterThan(0)
    expect(response.recommendations.length).toBeGreaterThan(0)
  })

  it('is deterministic for the same input with fixed Clock/IdGenerator', async () => {
    const input = {
      learningProjectId: 'project-1',
      plan: makeLearningPlan(),
      conversation: makeConversation(),
      memory: [],
    }
    const pipeline = createMentorPipeline({ idGenerator: makeSequentialIdGenerator(), clock: makeFixedClock() })
    const first = await pipeline.run(input)

    const pipeline2 = createMentorPipeline({ idGenerator: makeSequentialIdGenerator(), clock: makeFixedClock() })
    const second = await pipeline2.run(input)

    expect(second).toEqual(first)
  })
})

describe('createMentorPipeline — dependency injection (unit)', () => {
  it('feeds composed insights/recommendations into the injected ContextBuilder', async () => {
    const buildSpy = vi.fn().mockResolvedValue({ learningProjectId: 'project-1', recentMessages: [], insights: [], recommendations: [], memory: [] })
    const insights = [{ id: 'i1', type: 'progress' as const, summary: 's', detail: 'd' }]
    const recommendations = [{ id: 'r1', category: 'next-step' as const, priority: 'high' as const, title: 't', description: 'd' }]

    const pipeline = createMentorPipeline({
      insightComposer: { compose: vi.fn().mockResolvedValue(insights) },
      recommendationComposer: { compose: vi.fn().mockResolvedValue(recommendations) },
      contextBuilder: { build: buildSpy },
    })

    await pipeline.run({ learningProjectId: 'project-1', plan: makeLearningPlan(), conversation: makeConversation(), memory: [] })

    expect(buildSpy).toHaveBeenCalledWith(expect.objectContaining({ insights, recommendations }))
  })

  it('uses the injected ProviderAdapter’s reply content for the composed response', async () => {
    const pipeline = createMentorPipeline({
      providerAdapter: { generateReply: vi.fn().mockResolvedValue({ content: 'Custom mock reply' }) },
    })

    const response = await pipeline.run({ learningProjectId: 'project-1', plan: makeLearningPlan(), conversation: makeConversation(), memory: [] })

    expect(response.reply.content).toBe('Custom mock reply')
  })

  it('never calls a real network — every dependency stays in-process', async () => {
    const pipeline = createMentorPipeline()
    const start = Date.now()
    await pipeline.run({ learningProjectId: 'project-1', plan: makeLearningPlan(), conversation: makeConversation(), memory: [] })
    expect(Date.now() - start).toBeLessThan(100)
  })
})
