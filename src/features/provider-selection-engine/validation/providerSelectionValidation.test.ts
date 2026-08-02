import { describe, expect, it } from 'vitest'
import { validateProviderCatalogEntry } from './validateProviderCatalogEntry'
import { validateProviderRegistration } from './validateProviderRegistration'
import { makeProviderCatalogEntry } from '../testFixtures'

describe('validateProviderCatalogEntry (Metadata/Configuration validity)', () => {
  it('reports valid: true for a well-formed entry', () => {
    expect(validateProviderCatalogEntry(makeProviderCatalogEntry())).toEqual({ valid: true, issues: [] })
  })

  it('detects invalid-configuration for a non-positive priority', () => {
    const result = validateProviderCatalogEntry(makeProviderCatalogEntry({ priority: 0 }))
    expect(result.issues.some((issue) => issue.type === 'invalid-configuration')).toBe(true)
  })

  it('detects invalid-configuration for an empty supportedCapabilities list', () => {
    const result = validateProviderCatalogEntry(makeProviderCatalogEntry({ supportedCapabilities: [] }))
    expect(result.issues.some((issue) => issue.type === 'invalid-configuration')).toBe(true)
  })

  it('detects invalid-configuration for an empty supportedModels list', () => {
    const result = validateProviderCatalogEntry(makeProviderCatalogEntry({ supportedModels: [] }))
    expect(result.issues.some((issue) => issue.type === 'invalid-configuration')).toBe(true)
  })

  it('detects invalid-configuration for a non-positive maxRequestsPerMinute', () => {
    const result = validateProviderCatalogEntry(makeProviderCatalogEntry({ configuration: { enabled: true, maxRequestsPerMinute: 0 } }))
    expect(result.issues.some((issue) => issue.type === 'invalid-configuration')).toBe(true)
  })
})

describe('validateProviderRegistration (Duplicate Provider)', () => {
  it('reports valid: true when the provider id is not yet registered', () => {
    expect(validateProviderRegistration(['anthropic'], 'openai')).toEqual({ valid: true, issues: [] })
  })

  it('detects duplicate-provider for an already-registered provider id', () => {
    const result = validateProviderRegistration(['openai'], 'openai')
    expect(result.issues.some((issue) => issue.type === 'duplicate-provider')).toBe(true)
  })
})
