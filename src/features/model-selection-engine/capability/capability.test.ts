import { describe, expect, it } from 'vitest'
import { createModelCapabilityResolver } from './DefaultModelCapabilityResolver'
import { makeModelCatalogEntry, makeModelMetadata } from '../testFixtures'

describe('DefaultModelCapabilityResolver (Capability Matching)', () => {
  it('returns only the entries that declare the requested capability', () => {
    const resolver = createModelCapabilityResolver()
    const withVision = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o', supportedCapabilities: ['chat-completion', 'vision'] }) })
    const withoutVision = makeModelCatalogEntry({ metadata: makeModelMetadata({ id: 'gpt-4o-mini', supportedCapabilities: ['chat-completion'] }) })

    expect(resolver.filterByCapability([withVision, withoutVision], 'vision')).toEqual([withVision])
  })

  it('returns an empty list when no entry declares the requested capability', () => {
    const resolver = createModelCapabilityResolver()
    const entry = makeModelCatalogEntry({ metadata: makeModelMetadata({ supportedCapabilities: ['chat-completion'] }) })

    expect(resolver.filterByCapability([entry], 'multimodal')).toEqual([])
  })
})
