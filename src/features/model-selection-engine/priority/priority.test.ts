import { describe, expect, it } from 'vitest'
import { createModelPriorityResolver } from './DefaultModelPriorityResolver'
import { makeModelCatalogEntry, makeModelMetadata } from '../testFixtures'

describe('DefaultModelPriorityResolver (Priority Ordering)', () => {
  it('orders entries ascending by priority (lower number = more preferred)', () => {
    const resolver = createModelPriorityResolver()
    const low = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini' }), priority: 2 })
    const high = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o' }), priority: 1 })

    const ordered = resolver.order([low, high])

    expect(ordered.map((entry) => entry.metadata.id)).toEqual(['gpt-4o', 'gpt-4o-mini'])
  })

  it('does not mutate the input array', () => {
    const resolver = createModelPriorityResolver()
    const entries = [
      makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini' }), priority: 2 }),
      makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o' }), priority: 1 }),
    ]
    const originalOrder = entries.map((entry) => entry.metadata.id)

    resolver.order(entries)

    expect(entries.map((entry) => entry.metadata.id)).toEqual(originalOrder)
  })
})
