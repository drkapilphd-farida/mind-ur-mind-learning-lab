import { describe, expect, it } from 'vitest'
import { createProviderResolver, NoMatchingProviderError } from '.'
import { createCapabilityResolver } from '../capabilities'
import { createMockAIProvider } from '../adapters'
import { makeAIModel, makeCapabilities, makeProviderMetadata, makeSelectionCriteria } from '../testFixtures'
import type { AIModel } from '../types'
import type { AIProvider } from '../contracts'

function provider(id: string, models: readonly AIModel[] = [makeAIModel({ id: `${id}-model`, providerId: id })]): AIProvider {
  return createMockAIProvider({ metadata: makeProviderMetadata({ id }), models })
}

describe('DefaultProviderResolver', () => {
  const resolver = createProviderResolver(createCapabilityResolver())

  it('throws NoMatchingProviderError when given an empty candidate list', () => {
    expect(() => resolver.resolve([], makeSelectionCriteria())).toThrow(NoMatchingProviderError)
  })

  it('falls back to the first candidate when no model/capability criteria are given', () => {
    const candidates = [provider('a'), provider('b')]
    expect(resolver.resolve(candidates, makeSelectionCriteria())).toBe(candidates[0])
  })

  it('prefers a candidate with preferredModelId over the first candidate', () => {
    const a = provider('a')
    const b = provider('b', [makeAIModel({ id: 'special-model', providerId: 'b' })])
    const resolved = resolver.resolve([a, b], makeSelectionCriteria({ preferredModelId: 'special-model' }))
    expect(resolved).toBe(b)
  })

  it('falls back to fallbackModelId when preferredModelId matches nothing', () => {
    const a = provider('a')
    const b = provider('b', [makeAIModel({ id: 'fallback-model', providerId: 'b' })])
    const resolved = resolver.resolve([a, b], makeSelectionCriteria({ preferredModelId: 'missing-model', fallbackModelId: 'fallback-model' }))
    expect(resolved).toBe(b)
  })

  it('filters by requiredCapabilities before applying preferredModelId/fallbackModelId', () => {
    const chatOnly = provider('chat-only', [makeAIModel({ id: 'chat-model', providerId: 'chat-only', capabilities: makeCapabilities({ vision: false }) })])
    const visionCapable = provider('vision-capable', [makeAIModel({ id: 'vision-model', providerId: 'vision-capable', capabilities: makeCapabilities({ vision: true }) })])

    const resolved = resolver.resolve([chatOnly, visionCapable], makeSelectionCriteria({ requiredCapabilities: ['vision'] }))
    expect(resolved).toBe(visionCapable)
  })

  it('throws when requiredCapabilities excludes every candidate', () => {
    const chatOnly = provider('chat-only', [makeAIModel({ id: 'chat-model', providerId: 'chat-only', capabilities: makeCapabilities({ vision: false }) })])
    expect(() => resolver.resolve([chatOnly], makeSelectionCriteria({ requiredCapabilities: ['vision'] }))).toThrow(NoMatchingProviderError)
  })
})
