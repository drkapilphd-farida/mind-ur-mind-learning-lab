import { describe, expect, it, vi } from 'vitest'
import { ProviderAdapterError } from '@/features/ai-provider/adapter'
import type { AIProvider } from '@/features/ai-provider/contracts'
import type { AIResponse } from '@/features/ai-provider/types'
import { createAIFoundation, type AIFoundationDependencies } from './aiFoundation'
import type { AIFoundationPayload } from './types/AIFoundationRequest'
import type { AIResultCache, AIResultCacheEntry } from './types/AIResultCache'
import type { CostTracker, CostTrackingEntry } from './types/CostTracker'
import type { RateLimiter } from './types/RateLimiter'
import type { AIProviderFactory } from './types/AIProviderFactory'

const RESPONSE: AIResponse = {
  id: 'resp-1',
  providerId: 'claude',
  modelId: 'claude-3-5-sonnet-20241022',
  content: 'A real response.',
  usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
  finishReason: 'stop',
}

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    metadata: { id: 'claude', displayName: 'Claude', description: '', supportsFineTuning: false },
    models: [{ id: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', providerId: 'claude', capabilities: { chat: true, vision: false, imageGeneration: false, audio: false, reasoning: true, toolCalling: false, jsonMode: false, structuredOutput: false, streaming: false, multimodal: false }, contextWindowTokens: 200_000, maxOutputTokens: 8_192 }],
    generate: vi.fn().mockResolvedValue(RESPONSE),
    checkHealth: vi.fn().mockResolvedValue({ providerId: 'claude', state: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' }),
    estimateCost: vi.fn().mockReturnValue({ inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }),
    ...overrides,
  }
}

function makeCache(): AIResultCache & { store: Map<string, AIResultCacheEntry> } {
  const store = new Map<string, AIResultCacheEntry>()
  return {
    store,
    get: vi.fn(async (key: string) => store.get(key)),
    set: vi.fn(async (key: string, entry: AIResultCacheEntry) => {
      store.set(key, entry)
    }),
  }
}

function makeCostTracker(): CostTracker & { entries: CostTrackingEntry[] } {
  const entries: CostTrackingEntry[] = []
  return {
    entries,
    record: vi.fn((entry: CostTrackingEntry) => entries.push(entry)),
    list: () => [...entries],
    totalCostCents: () => entries.reduce((sum, entry) => sum + entry.actualCost.totalCostCents, 0),
  }
}

function makeRateLimiter(allowed = true): RateLimiter {
  return { tryAcquire: vi.fn().mockReturnValue(allowed ? { allowed: true } : { allowed: false, reason: 'Rate limit exceeded.', retryAfterMs: 1000 }) }
}

function makeProviderFactory(provider: AIProvider): AIProviderFactory {
  return { resolveProvider: vi.fn().mockResolvedValue(provider) }
}

const PAYLOAD: AIFoundationPayload = { messages: [{ role: 'user', content: 'Summarize this chunk of real content.' }] }

function makeDependencies(overrides: Partial<AIFoundationDependencies> = {}): AIFoundationDependencies {
  return {
    providerFactory: makeProviderFactory(makeProvider()),
    cache: makeCache(),
    costTracker: makeCostTracker(),
    rateLimiter: makeRateLimiter(),
    configuration: { retryPolicy: { maxAttempts: 3, backoffStrategy: 'fixed', baseDelayMs: 0 }, rateLimitPolicy: { maxRequestsPerMinute: 60, maxTokensPerMinute: 100_000 }, cacheTtlSeconds: 3600 },
    pricingTable: { 'claude-3-5-sonnet-20241022': { inputCentsPer1kTokens: 0.3, outputCentsPer1kTokens: 1.5 } },
    idFactory: () => 'generated-id',
    now: () => new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('AIFoundation.execute', () => {
  it('resolves a provider, calls generate(), and returns a real success result', async () => {
    const foundation = createAIFoundation(makeDependencies())
    const result = await foundation.execute('summarization', PAYLOAD)

    expect(result.success).toBe(true)
    if (!result.success) throw new Error('expected success')
    expect(result.response).toEqual(RESPONSE)
    expect(result.cacheHit).toBe(false)
    expect(result.usage.tokens).toEqual(RESPONSE.usage)
    expect(result.usage.cost.currency).toBe('USD')
    expect(result.usage.cost.inputCostCents).toBeCloseTo(0.03, 10)
    expect(result.usage.cost.outputCostCents).toBeCloseTo(0.075, 10)
    expect(result.usage.cost.totalCostCents).toBeCloseTo(0.105, 10)
  })

  it('records a real CostTrackingEntry on success', async () => {
    const costTracker = makeCostTracker()
    const foundation = createAIFoundation(makeDependencies({ costTracker }))
    await foundation.execute('summarization', PAYLOAD, 'req-123')

    expect(costTracker.entries).toHaveLength(1)
    expect(costTracker.entries[0]).toMatchObject({ requestId: 'req-123', task: 'summarization', providerId: 'claude', modelId: 'claude-3-5-sonnet-20241022', cacheHit: false })
  })

  it('writes the result to cache after a successful call', async () => {
    const cache = makeCache()
    const foundation = createAIFoundation(makeDependencies({ cache }))
    await foundation.execute('summarization', PAYLOAD)

    expect(cache.store.size).toBe(1)
  })

  it('returns a cache hit without calling the provider again', async () => {
    const provider = makeProvider()
    const cache = makeCache()
    const deps = makeDependencies({ providerFactory: makeProviderFactory(provider), cache })

    const foundation = createAIFoundation(deps)
    await foundation.execute('summarization', PAYLOAD)
    const second = await foundation.execute('summarization', PAYLOAD)

    expect(provider.generate).toHaveBeenCalledTimes(1)
    expect(second.success).toBe(true)
    if (!second.success) throw new Error('expected success')
    expect(second.cacheHit).toBe(true)
    expect(second.response).toEqual(RESPONSE)
  })

  it('records a zero-cost CostTrackingEntry for a cache hit', async () => {
    const costTracker = makeCostTracker()
    const deps = makeDependencies({ costTracker })
    const foundation = createAIFoundation(deps)

    await foundation.execute('summarization', PAYLOAD)
    await foundation.execute('summarization', PAYLOAD)

    expect(costTracker.entries).toHaveLength(2)
    expect(costTracker.entries[1]?.cacheHit).toBe(true)
    expect(costTracker.entries[1]?.actualCost.totalCostCents).toBe(0)
  })

  it('skips the cache when payload.cache.enabled is false', async () => {
    const provider = makeProvider()
    const foundation = createAIFoundation(makeDependencies({ providerFactory: makeProviderFactory(provider) }))

    await foundation.execute('summarization', { ...PAYLOAD, cache: { enabled: false } })
    await foundation.execute('summarization', { ...PAYLOAD, cache: { enabled: false } })

    expect(provider.generate).toHaveBeenCalledTimes(2)
  })

  it('blocks the request when the rate limiter denies it, without calling the provider', async () => {
    const provider = makeProvider()
    const foundation = createAIFoundation(makeDependencies({ providerFactory: makeProviderFactory(provider), rateLimiter: makeRateLimiter(false) }))

    const result = await foundation.execute('summarization', PAYLOAD)

    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error.code).toBe('rate-limited')
    expect(provider.generate).not.toHaveBeenCalled()
  })

  it('returns a structured failure when provider resolution throws', async () => {
    const providerFactory: AIProviderFactory = { resolveProvider: vi.fn().mockRejectedValue(new Error('No provider registered.')) }
    const foundation = createAIFoundation(makeDependencies({ providerFactory }))

    const result = await foundation.execute('summarization', PAYLOAD)

    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error.code).toBe('provider-unavailable')
  })

  it('returns a structured failure when the resolved provider has no models', async () => {
    const provider = makeProvider({ models: [] })
    const foundation = createAIFoundation(makeDependencies({ providerFactory: makeProviderFactory(provider) }))

    const result = await foundation.execute('summarization', PAYLOAD)

    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error.code).toBe('invalid-request')
  })

  it('falls back to the provider\'s first model when payload.modelId is omitted', async () => {
    const provider = makeProvider()
    const foundation = createAIFoundation(makeDependencies({ providerFactory: makeProviderFactory(provider) }))

    await foundation.execute('summarization', PAYLOAD)

    expect(provider.generate).toHaveBeenCalledWith(expect.objectContaining({ modelId: 'claude-3-5-sonnet-20241022' }))
  })

  it('retries a retryable provider failure and eventually returns a structured error after exhausting attempts', async () => {
    const provider = makeProvider({
      generate: vi.fn().mockRejectedValue(new ProviderAdapterError({ code: 'rate-limited', message: 'Too many requests.', providerId: 'claude', retryable: true })),
    })
    const deps = makeDependencies({ providerFactory: makeProviderFactory(provider), configuration: { retryPolicy: { maxAttempts: 2, backoffStrategy: 'fixed', baseDelayMs: 0 }, rateLimitPolicy: { maxRequestsPerMinute: 60, maxTokensPerMinute: 100_000 }, cacheTtlSeconds: 3600 } })
    const foundation = createAIFoundation(deps)

    const result = await foundation.execute('summarization', PAYLOAD)

    expect(provider.generate).toHaveBeenCalledTimes(2)
    expect(result.success).toBe(false)
    if (result.success) throw new Error('expected failure')
    expect(result.error.code).toBe('rate-limited')
  })

  it('does not write a failed request to the cache', async () => {
    const provider = makeProvider({
      generate: vi.fn().mockRejectedValue(new ProviderAdapterError({ code: 'invalid-request', message: 'Bad request.', providerId: 'claude', retryable: false })),
    })
    const cache = makeCache()
    const foundation = createAIFoundation(makeDependencies({ providerFactory: makeProviderFactory(provider), cache }))

    await foundation.execute('summarization', PAYLOAD)

    expect(cache.store.size).toBe(0)
  })

  it('a cache write failure does not fail the overall successful result', async () => {
    const cache = makeCache()
    cache.set = vi.fn().mockRejectedValue(new Error('cache backend unreachable'))
    const foundation = createAIFoundation(makeDependencies({ cache }))

    const result = await foundation.execute('summarization', PAYLOAD)

    expect(result.success).toBe(true)
  })

  it('a cost-tracking failure does not fail the overall successful result', async () => {
    const costTracker = makeCostTracker()
    costTracker.record = vi.fn(() => {
      throw new Error('tracker backend unreachable')
    })
    const foundation = createAIFoundation(makeDependencies({ costTracker }))

    const result = await foundation.execute('summarization', PAYLOAD)

    expect(result.success).toBe(true)
  })

  it('uses a caller-supplied requestId when provided, instead of generating one', async () => {
    const foundation = createAIFoundation(makeDependencies())
    const result = await foundation.execute('summarization', PAYLOAD, 'caller-supplied-id')
    expect(result.requestId).toBe('caller-supplied-id')
  })
})
