import { describe, expect, it } from 'vitest'
import type { AIResultCacheEntry } from '../types/AIResultCache'
import { createInMemoryAIResultCache } from './InMemoryAIResultCache'

function makeEntry(overrides: Partial<AIResultCacheEntry> = {}): AIResultCacheEntry {
  return {
    response: { id: 'resp-1', providerId: 'mock', modelId: 'mock-default-chat', content: 'Hello.', usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 }, finishReason: 'stop' },
    usage: { providerId: 'mock', modelId: 'mock-default-chat', tokens: { inputTokens: 10, outputTokens: 5, totalTokens: 15 }, cost: { inputCostCents: 0, outputCostCents: 0, totalCostCents: 0, currency: 'USD' }, occurredAt: '2026-01-01T00:00:00.000Z' },
    cachedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('InMemoryAIResultCache', () => {
  it('misses on an unknown key', async () => {
    const cache = createInMemoryAIResultCache()
    expect(await cache.get('unknown')).toBeUndefined()
  })

  it('returns a previously set entry', async () => {
    const cache = createInMemoryAIResultCache()
    const entry = makeEntry()
    await cache.set('key-1', entry)
    expect(await cache.get('key-1')).toEqual(entry)
  })

  it('never expires an entry set without a ttl', async () => {
    let currentTime = new Date('2026-01-01T00:00:00.000Z')
    const cache = createInMemoryAIResultCache({ now: () => currentTime })
    await cache.set('key-1', makeEntry())

    currentTime = new Date('2030-01-01T00:00:00.000Z')
    expect(await cache.get('key-1')).toEqual(makeEntry())
  })

  it('expires an entry once its ttl has elapsed', async () => {
    let currentTime = new Date('2026-01-01T00:00:00.000Z')
    const cache = createInMemoryAIResultCache({ now: () => currentTime })
    await cache.set('key-1', makeEntry(), 60)

    currentTime = new Date('2026-01-01T00:00:59.000Z')
    expect(await cache.get('key-1')).toEqual(makeEntry())

    currentTime = new Date('2026-01-01T00:01:00.001Z')
    expect(await cache.get('key-1')).toBeUndefined()
  })

  it('applies defaultTtlSeconds when set() is called without its own ttl', async () => {
    let currentTime = new Date('2026-01-01T00:00:00.000Z')
    const cache = createInMemoryAIResultCache({ now: () => currentTime, defaultTtlSeconds: 30 })
    await cache.set('key-1', makeEntry())

    currentTime = new Date('2026-01-01T00:00:31.000Z')
    expect(await cache.get('key-1')).toBeUndefined()
  })

  it('lets a per-call ttl override defaultTtlSeconds', async () => {
    let currentTime = new Date('2026-01-01T00:00:00.000Z')
    const cache = createInMemoryAIResultCache({ now: () => currentTime, defaultTtlSeconds: 30 })
    await cache.set('key-1', makeEntry(), 120)

    currentTime = new Date('2026-01-01T00:00:31.000Z')
    expect(await cache.get('key-1')).toEqual(makeEntry())
  })
})
