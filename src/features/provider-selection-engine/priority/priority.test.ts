import { describe, expect, it } from 'vitest'
import { createProviderPriorityResolver } from './DefaultProviderPriorityResolver'
import { makeProviderCatalogEntry } from '../testFixtures'

describe('DefaultProviderPriorityResolver (Priority Ordering)', () => {
  it('orders entries ascending by priority (lower number = more preferred)', () => {
    const resolver = createProviderPriorityResolver()
    const low = makeProviderCatalogEntry({ providerId: 'grok', priority: 4 })
    const high = makeProviderCatalogEntry({ providerId: 'openai', priority: 1 })
    const mid = makeProviderCatalogEntry({ providerId: 'anthropic', priority: 2 })

    const ordered = resolver.order([low, high, mid])

    expect(ordered.map((entry) => entry.providerId)).toEqual(['openai', 'anthropic', 'grok'])
  })

  it('does not mutate the input array', () => {
    const resolver = createProviderPriorityResolver()
    const entries = [makeProviderCatalogEntry({ providerId: 'grok', priority: 4 }), makeProviderCatalogEntry({ providerId: 'openai', priority: 1 })]
    const originalOrder = entries.map((entry) => entry.providerId)

    resolver.order(entries)

    expect(entries.map((entry) => entry.providerId)).toEqual(originalOrder)
  })
})
