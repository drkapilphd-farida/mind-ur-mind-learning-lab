import { describe, expect, it } from 'vitest'
import { computeConfigurationDiagnostics } from './computeConfigurationDiagnostics'
import type { ConfigurationKeySchema } from '../validation'
import { makeMemoryConfiguration } from '../testFixtures'

describe('computeConfigurationDiagnostics', () => {
  const schema: readonly ConfigurationKeySchema[] = [{ key: 'a', required: true, type: 'number', allowOverride: true }]

  it('reports the active profile id from configuration metadata', () => {
    const configuration = makeMemoryConfiguration({
      entries: [{ key: 'a', value: 1 }],
      metadata: { profileId: 'profile-x', version: 1, createdAt: 'x', updatedAt: 'x' },
    })
    expect(computeConfigurationDiagnostics(configuration, schema, []).activeProfileId).toBe('profile-x')
  })

  it('reports the given configuration as effectiveConfiguration', () => {
    const configuration = makeMemoryConfiguration({ entries: [{ key: 'a', value: 1 }] })
    expect(computeConfigurationDiagnostics(configuration, schema, []).effectiveConfiguration).toBe(configuration)
  })

  it('reports overrideCount as the number of given override entries', () => {
    const configuration = makeMemoryConfiguration({ entries: [{ key: 'a', value: 1 }] })
    const overrideEntries = [{ key: 'a', value: 1 }, { key: 'b', value: 2 }]
    expect(computeConfigurationDiagnostics(configuration, schema, overrideEntries).overrideCount).toBe(2)
  })

  it('reports validationStatus valid for a consistent configuration', () => {
    const configuration = makeMemoryConfiguration({ entries: [{ key: 'a', value: 1 }] })
    expect(computeConfigurationDiagnostics(configuration, schema, []).validationStatus).toBe('valid')
  })

  it('reports validationStatus invalid when a required value is missing', () => {
    const configuration = makeMemoryConfiguration({ entries: [] })
    expect(computeConfigurationDiagnostics(configuration, schema, []).validationStatus).toBe('invalid')
  })

  it('reports configurationVersion from configuration metadata', () => {
    const configuration = makeMemoryConfiguration({
      entries: [{ key: 'a', value: 1 }],
      metadata: { profileId: null, version: 7, createdAt: 'x', updatedAt: 'x' },
    })
    expect(computeConfigurationDiagnostics(configuration, schema, []).configurationVersion).toBe(7)
  })
})
