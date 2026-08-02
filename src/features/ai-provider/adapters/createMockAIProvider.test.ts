import { describe, expect, it } from 'vitest'
import { createMockAIProvider } from './createMockAIProvider'
import { UnknownModelError } from './UnknownModelError'
import { makeAIModel, makeAIRequest, makeFixedClock, makeProviderMetadata, makeSequentialIdGenerator } from '../testFixtures'

describe('createMockAIProvider', () => {
  it('generates a deterministic response referencing the resolved model and last user message', async () => {
    const provider = createMockAIProvider({
      metadata: makeProviderMetadata({ id: 'acme', displayName: 'Acme' }),
      models: [makeAIModel({ id: 'acme-chat', displayName: 'Acme Chat' })],
      idGenerator: makeSequentialIdGenerator('response'),
      clock: makeFixedClock(),
    })

    const response = await provider.generate(makeAIRequest({ modelId: 'acme-chat', messages: [{ role: 'user', content: 'Hi there' }] }))

    expect(response.id).toBe('response-1')
    expect(response.providerId).toBe('acme')
    expect(response.modelId).toBe('acme-chat')
    expect(response.content).toContain('Acme')
    expect(response.content).toContain('Acme Chat')
    expect(response.content).toContain('Hi there')
    expect(response.finishReason).toBe('stop')
  })

  it('throws UnknownModelError for a modelId the provider does not declare', async () => {
    const provider = createMockAIProvider({ metadata: makeProviderMetadata(), models: [makeAIModel({ id: 'known-model' })] })
    await expect(provider.generate(makeAIRequest({ modelId: 'unknown-model' }))).rejects.toThrow(UnknownModelError)
  })

  it('reports token usage that sums input and output tokens', async () => {
    const provider = createMockAIProvider({ metadata: makeProviderMetadata(), models: [makeAIModel()] })
    const response = await provider.generate(makeAIRequest())
    expect(response.usage.totalTokens).toBe(response.usage.inputTokens + response.usage.outputTokens)
  })

  it('checkHealth reports healthy using the injected clock', async () => {
    const provider = createMockAIProvider({ metadata: makeProviderMetadata({ id: 'acme' }), models: [makeAIModel()], clock: makeFixedClock('2026-03-01T00:00:00.000Z') })
    const health = await provider.checkHealth()
    expect(health).toEqual({ providerId: 'acme', state: 'healthy', checkedAt: '2026-03-01T00:00:00.000Z' })
  })

  it('estimateCost throws UnknownModelError for an unrecognized model, without calling generate', () => {
    const provider = createMockAIProvider({ metadata: makeProviderMetadata(), models: [makeAIModel({ id: 'known-model' })] })
    expect(() => provider.estimateCost(makeAIRequest({ modelId: 'unknown-model' }))).toThrow(UnknownModelError)
  })

  it('estimateCost sums input and output cost into totalCostCents, in USD', () => {
    const provider = createMockAIProvider({ metadata: makeProviderMetadata(), models: [makeAIModel({ id: 'known-model' })] })
    const cost = provider.estimateCost(makeAIRequest({ modelId: 'known-model' }))
    expect(cost.currency).toBe('USD')
    expect(cost.totalCostCents).toBe(cost.inputCostCents + cost.outputCostCents)
  })
})
