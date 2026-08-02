import { describe, expect, it, vi } from 'vitest'
import { createMockProviderAdapter } from './MockProviderAdapter'
import { ProviderAdapterError } from './ProviderAdapterError'
import { makeAIModel, makeAIRequest, makeFixedClock, makeProviderMetadata, makeSequentialIdGenerator } from '../testFixtures'
import type { ProviderAdapter, RequestMapper } from '../contracts'
import type { ProviderAdapterDependencies } from './BaseProviderAdapter'

function buildAdapter(overrides: Partial<ProviderAdapterDependencies> = {}): ProviderAdapter {
  return createMockProviderAdapter({
    metadata: makeProviderMetadata({ id: 'acme', displayName: 'Acme' }),
    models: [makeAIModel({ id: 'acme-chat', displayName: 'Acme Chat', providerId: 'acme' })],
    overrides: { clock: makeFixedClock(), idGenerator: makeSequentialIdGenerator('response'), ...overrides },
  })
}

describe('MockProviderAdapter (via BaseProviderAdapter)', () => {
  it('throws ProviderAdapterError with provider-unavailable before initialize() is called', async () => {
    const adapter = buildAdapter()
    await expect(adapter.generate(makeAIRequest({ modelId: 'acme-chat' }))).rejects.toMatchObject({
      aiError: { code: 'provider-unavailable', providerId: 'acme', retryable: true },
    })
  })

  it('generates a deterministic response end-to-end once initialized', async () => {
    const adapter = buildAdapter()
    await adapter.initialize()

    const response = await adapter.generate(makeAIRequest({ modelId: 'acme-chat', messages: [{ role: 'user', content: 'Hi there' }] }))

    expect(response.id).toBe('response-1')
    expect(response.providerId).toBe('acme')
    expect(response.modelId).toBe('acme-chat')
    expect(response.content).toContain('Acme Chat')
    expect(response.content).toContain('Hi there')
    expect(response.finishReason).toBe('stop')
    expect(response.usage.totalTokens).toBe(response.usage.inputTokens + response.usage.outputTokens)
  })

  it('throws ProviderAdapterError with invalid-request for an unknown modelId', async () => {
    const adapter = buildAdapter()
    await adapter.initialize()
    await expect(adapter.generate(makeAIRequest({ modelId: 'does-not-exist' }))).rejects.toBeInstanceOf(ProviderAdapterError)
    await expect(adapter.generate(makeAIRequest({ modelId: 'does-not-exist' }))).rejects.toMatchObject({ aiError: { code: 'invalid-request' } })
  })

  it('throws ProviderAdapterError with invalid-request for an empty messages array', async () => {
    const adapter = buildAdapter()
    await adapter.initialize()
    await expect(adapter.generate(makeAIRequest({ modelId: 'acme-chat', messages: [] }))).rejects.toMatchObject({ aiError: { code: 'invalid-request' } })
  })

  it('stops working again after shutdown()', async () => {
    const adapter = buildAdapter()
    await adapter.initialize()
    await adapter.shutdown()
    await expect(adapter.generate(makeAIRequest({ modelId: 'acme-chat' }))).rejects.toMatchObject({ aiError: { code: 'provider-unavailable' } })
  })

  it('checkHealth never throws, and reports state truthfully across the lifecycle', async () => {
    const adapter = buildAdapter()
    expect((await adapter.checkHealth()).state).toBe('unavailable')
    await adapter.initialize()
    expect((await adapter.checkHealth()).state).toBe('healthy')
  })

  it('estimateCost requires initialize() too, and returns a real breakdown once ready', async () => {
    const adapter = buildAdapter()
    expect(() => adapter.estimateCost(makeAIRequest({ modelId: 'acme-chat' }))).toThrow(ProviderAdapterError)

    await adapter.initialize()
    const cost = adapter.estimateCost(makeAIRequest({ modelId: 'acme-chat' }))
    expect(cost.currency).toBe('USD')
    expect(cost.totalCostCents).toBe(cost.inputCostCents + cost.outputCostCents)
  })

  it('invokes the injected RequestMapper (dependency injection is real, not decorative)', async () => {
    const mapRequestSpy = vi.fn(() => ({ modelId: 'acme-chat', prompt: 'stubbed prompt', maxOutputTokens: 10 }))
    const stubMapper: RequestMapper = { mapRequest: mapRequestSpy }
    const adapter = buildAdapter({ requestMapper: stubMapper })
    await adapter.initialize()

    const response = await adapter.generate(makeAIRequest({ modelId: 'acme-chat' }))
    expect(mapRequestSpy).toHaveBeenCalledTimes(1)
    expect(response.content).toContain('stubbed prompt')
  })
})
