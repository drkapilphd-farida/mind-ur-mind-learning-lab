import { describe, expect, it } from 'vitest'
import type { AIFoundationPayload } from '../types/AIFoundationRequest'
import { computeCacheKey } from './computeCacheKey'

function makePayload(overrides: Partial<AIFoundationPayload> = {}): AIFoundationPayload {
  return {
    messages: [{ role: 'user', content: 'Summarize this chunk.' }],
    ...overrides,
  }
}

describe('computeCacheKey', () => {
  it('is deterministic for the same task and payload', () => {
    const payload = makePayload()
    expect(computeCacheKey('summarization', payload)).toBe(computeCacheKey('summarization', payload))
  })

  it('produces different keys for different tasks over identical content', () => {
    const payload = makePayload()
    expect(computeCacheKey('summarization', payload)).not.toBe(computeCacheKey('keyword-extraction', payload))
  })

  it('produces different keys for different message content', () => {
    const a = makePayload({ messages: [{ role: 'user', content: 'First.' }] })
    const b = makePayload({ messages: [{ role: 'user', content: 'Second.' }] })
    expect(computeCacheKey('summarization', a)).not.toBe(computeCacheKey('summarization', b))
  })

  it('produces different keys for different modelId/temperature/maxOutputTokens', () => {
    const base = makePayload()
    const withModel = makePayload({ modelId: 'claude-3-5-sonnet-20241022' })
    const withTemperature = makePayload({ temperature: 0.7 })
    const withMaxTokens = makePayload({ maxOutputTokens: 512 })

    const baseKey = computeCacheKey('summarization', base)
    expect(computeCacheKey('summarization', withModel)).not.toBe(baseKey)
    expect(computeCacheKey('summarization', withTemperature)).not.toBe(baseKey)
    expect(computeCacheKey('summarization', withMaxTokens)).not.toBe(baseKey)
  })

  it('ignores the cache options field — it is not part of request identity', () => {
    const a = makePayload({ cache: { enabled: true, ttlSeconds: 60 } })
    const b = makePayload({ cache: { enabled: false } })
    expect(computeCacheKey('summarization', a)).toBe(computeCacheKey('summarization', b))
  })

  it('returns a hex sha256 digest', () => {
    const key = computeCacheKey('summarization', makePayload())
    expect(key).toMatch(/^[0-9a-f]{64}$/)
  })
})
