import { describe, expect, it, vi } from 'vitest'
import { MentorAIProviderAdapter, createMentorAIProviderAdapter, type MentorAIProviderAdapterDependencies } from './MentorAIProviderAdapter'
import { createMockProviderAdapter } from '@/features/ai-provider/adapter'
import { makeAIModel, makeProviderMetadata, makeSequentialIdGenerator } from '@/features/ai-provider/testFixtures'
import type { MentorContext } from '@/features/ai-mentor/types'
import type { MentorPrompt } from '@/features/ai-mentor/contracts'

const FAKE_CONTEXT: MentorContext = { learningProjectId: 'project-1', recentMessages: [], insights: [], recommendations: [], memory: [] }

function buildDependencies(overrides: Partial<MentorAIProviderAdapterDependencies> = {}): MentorAIProviderAdapterDependencies {
  const adapter = createMockProviderAdapter({
    metadata: makeProviderMetadata({ id: 'acme', displayName: 'Acme' }),
    models: [makeAIModel({ id: 'acme-model', displayName: 'Acme Model', providerId: 'acme' })],
  })

  return {
    factory: { resolve: () => adapter },
    lifecycleAdapters: [adapter],
    selectionCriteria: { preferredModelId: 'acme-model' },
    idGenerator: makeSequentialIdGenerator('request'),
    ...overrides,
  }
}

describe('MentorAIProviderAdapter', () => {
  it('generates a reply end-to-end through the real ai-provider mock pipeline', async () => {
    const adapter = new MentorAIProviderAdapter(buildDependencies())
    const prompt: MentorPrompt = { messages: [{ role: 'learner', content: 'How do I improve?' }] }

    const reply = await adapter.generateReply(prompt, FAKE_CONTEXT)

    expect(reply.content).toContain('Acme Model')
    expect(reply.content).toContain('How do I improve?')
  })

  it('initializes every lifecycle adapter exactly once, even across multiple generateReply calls', async () => {
    const deps = buildDependencies()
    const [lifecycleAdapter] = deps.lifecycleAdapters
    if (!lifecycleAdapter) throw new Error('expected at least one lifecycle adapter in test fixture')
    const initializeSpy = vi.spyOn(lifecycleAdapter, 'initialize')

    const adapter = new MentorAIProviderAdapter(deps)
    await adapter.generateReply({ messages: [{ role: 'learner', content: 'Hi' }] }, FAKE_CONTEXT)
    await adapter.generateReply({ messages: [{ role: 'learner', content: 'Hi' }] }, FAKE_CONTEXT)

    expect(initializeSpy).toHaveBeenCalledTimes(1)
  })

  it('resolves a provider via the injected factory, using the injected selectionCriteria', async () => {
    const deps = buildDependencies({ selectionCriteria: { providerId: 'acme', preferredModelId: 'acme-model', requiredCapabilities: ['chat'] } })
    const resolveSpy = vi.spyOn(deps.factory, 'resolve')

    const adapter = new MentorAIProviderAdapter(deps)
    await adapter.generateReply({ messages: [{ role: 'learner', content: 'Hi' }] }, FAKE_CONTEXT)

    expect(resolveSpy).toHaveBeenCalledWith({ providerId: 'acme', preferredModelId: 'acme-model', requiredCapabilities: ['chat'] })
  })

  it('uses the injected IdGenerator for every outgoing AIRequest id', async () => {
    const deps = buildDependencies()
    const generateSpy = vi.spyOn(deps.idGenerator, 'generate')

    const adapter = new MentorAIProviderAdapter(deps)
    await adapter.generateReply({ messages: [{ role: 'learner', content: 'Hi' }] }, FAKE_CONTEXT)

    expect(generateSpy).toHaveBeenCalledTimes(1)
  })

  it('createMentorAIProviderAdapter (no overrides) works end-to-end with real default dependencies', async () => {
    const adapter = createMentorAIProviderAdapter()
    const reply = await adapter.generateReply({ messages: [{ role: 'learner', content: 'Hi' }] }, FAKE_CONTEXT)
    expect(typeof reply.content).toBe('string')
    expect(reply.content.length).toBeGreaterThan(0)
  })
})
