import { describe, expect, it } from 'vitest'
import { validateModelCatalogEntryConfiguration } from './validateModelCatalogEntryConfiguration'
import { validateModelRegistration } from './validateModelRegistration'
import { validateKnownModel } from './validateKnownModel'
import { validateModelEnabled } from './validateModelEnabled'
import { validateCapabilitySupport } from './validateCapabilitySupport'
import { validateRegistryNotEmpty } from './validateRegistryNotEmpty'
import { makeModelCatalogEntry, makeModelMetadata } from '../testFixtures'

describe('validateModelCatalogEntryConfiguration (Invalid configuration)', () => {
  it('reports valid: true for a well-formed entry', () => {
    expect(validateModelCatalogEntryConfiguration(makeModelCatalogEntry())).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-configuration for a non-positive priority', () => {
    const result = validateModelCatalogEntryConfiguration(makeModelCatalogEntry({ priority: 0 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-configuration')).toBe(true)
  })

  it('detects invalid-configuration for a non-positive contextSize', () => {
    const result = validateModelCatalogEntryConfiguration(makeModelCatalogEntry({ metadata: makeModelMetadata({ contextSize: 0 }) }))
    expect(result.issues.some((issue) => issue.type === 'invalid-configuration')).toBe(true)
  })

  it('detects invalid-configuration for an empty supportedCapabilities list', () => {
    const result = validateModelCatalogEntryConfiguration(makeModelCatalogEntry({ metadata: makeModelMetadata({ supportedCapabilities: [] }) }))
    expect(result.issues.some((issue) => issue.type === 'invalid-configuration')).toBe(true)
  })
})

describe('validateModelRegistration (Duplicate model registration)', () => {
  it('reports valid: true when the model id is not yet registered', () => {
    expect(validateModelRegistration(['claude-3-5-sonnet'], 'gpt-4o')).toEqual({ valid: true, issues: [] })
  })

  it('detects duplicate-model for an already-registered model id', () => {
    const result = validateModelRegistration(['gpt-4o'], 'gpt-4o')
    expect(result.issues.some((issue) => issue.type === 'duplicate-model')).toBe(true)
  })
})

describe('validateKnownModel (Unknown model)', () => {
  it('reports valid: true for a known model id', () => {
    expect(validateKnownModel(['gpt-4o'], 'gpt-4o')).toEqual({ valid: true, issues: [] })
  })

  it('detects unknown-model for an unregistered model id', () => {
    const result = validateKnownModel(['gpt-4o'], 'unknown-model-id')
    expect(result.issues.some((issue) => issue.type === 'unknown-model')).toBe(true)
  })
})

describe('validateModelEnabled (Disabled model)', () => {
  it('reports valid: true for an enabled model', () => {
    expect(validateModelEnabled(makeModelCatalogEntry())).toEqual({ valid: true, issues: [] })
  })

  it('detects disabled-model for a disabled model', () => {
    const result = validateModelEnabled(makeModelCatalogEntry({ configuration: { enabled: false, maxRequestsPerMinute: 10 } }))
    expect(result.issues.some((issue) => issue.type === 'disabled-model')).toBe(true)
  })
})

describe('validateCapabilitySupport (Unsupported capability)', () => {
  it('reports valid: true when the model supports the capability', () => {
    const entry = makeModelCatalogEntry({ metadata: makeModelMetadata({ supportedCapabilities: ['chat-completion', 'vision'] }) })
    expect(validateCapabilitySupport(entry, 'vision')).toEqual({ valid: true, issues: [] })
  })

  it('detects unsupported-capability when the model lacks the capability', () => {
    const entry = makeModelCatalogEntry({ metadata: makeModelMetadata({ supportedCapabilities: ['chat-completion'] }) })
    const result = validateCapabilitySupport(entry, 'vision')
    expect(result.issues.some((issue) => issue.type === 'unsupported-capability')).toBe(true)
  })
})

describe('validateRegistryNotEmpty (Empty registry)', () => {
  it('reports valid: true when entries exist', () => {
    expect(validateRegistryNotEmpty([makeModelCatalogEntry()])).toEqual({ valid: true, issues: [] })
  })

  it('detects empty-registry when there are no entries', () => {
    const result = validateRegistryNotEmpty([])
    expect(result.issues.some((issue) => issue.type === 'empty-registry')).toBe(true)
  })
})
