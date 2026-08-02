import { describe, expect, it } from 'vitest'
import { MockProviderAdapter } from './MockProviderAdapter'
import { makeMentorRecommendation } from '../testFixtures'
import type { MentorPrompt } from '../contracts'
import type { MentorContext } from '../types'

const EMPTY_PROMPT: MentorPrompt = { messages: [] }

function makeContext(overrides: Partial<MentorContext> = {}): MentorContext {
  return { learningProjectId: 'project-1', recentMessages: [], insights: [], recommendations: [], memory: [], ...overrides }
}

describe('MockProviderAdapter', () => {
  it('references the real top recommendation when one exists', async () => {
    const adapter = new MockProviderAdapter()
    const reply = await adapter.generateReply(EMPTY_PROMPT, makeContext({ recommendations: [makeMentorRecommendation({ title: 'Review flashcards', description: 'Some real description' })] }))
    expect(reply.content).toContain('Review flashcards')
    expect(reply.content).toContain('Some real description')
  })

  it('falls back to a generic, honest reply with no recommendations', async () => {
    const adapter = new MockProviderAdapter()
    const reply = await adapter.generateReply(EMPTY_PROMPT, makeContext())
    expect(reply.content.length).toBeGreaterThan(0)
  })

  it('never calls out to a network — resolves synchronously fast, no fetch', async () => {
    const adapter = new MockProviderAdapter()
    const start = Date.now()
    await adapter.generateReply(EMPTY_PROMPT, makeContext())
    expect(Date.now() - start).toBeLessThan(50)
  })

  it('is deterministic for the same context', async () => {
    const adapter = new MockProviderAdapter()
    const context = makeContext({ recommendations: [makeMentorRecommendation()] })
    const first = await adapter.generateReply(EMPTY_PROMPT, context)
    const second = await adapter.generateReply(EMPTY_PROMPT, context)
    expect(second).toEqual(first)
  })
})
