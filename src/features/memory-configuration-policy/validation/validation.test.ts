import { describe, expect, it } from 'vitest'
import { findDuplicateKeys } from './findDuplicateKeys'
import { validateConfiguration } from './validateConfiguration'
import { validateConfigurationProfile } from './validateConfigurationProfile'
import type { ConfigurationKeySchema } from './ConfigurationKeySchema'
import { makeConfigurationProfile, makeMemoryConfiguration } from '../testFixtures'

describe('findDuplicateKeys', () => {
  it('returns an empty array when there are no duplicates', () => {
    expect(findDuplicateKeys([{ key: 'a', value: 1 }, { key: 'b', value: 2 }])).toEqual([])
  })

  it('returns each duplicated key once', () => {
    expect(
      findDuplicateKeys([
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
        { key: 'a', value: 3 },
        { key: 'b', value: 4 },
      ]),
    ).toEqual(['a'])
  })
})

describe('validateConfiguration', () => {
  const schema: readonly ConfigurationKeySchema[] = [
    { key: 'required-key', required: true, type: 'string', allowOverride: true },
    { key: 'typed-key', required: false, type: 'number', allowOverride: true },
    { key: 'locked-key', required: false, type: 'boolean', allowOverride: false },
  ]

  it('reports valid: true for a well-formed configuration and overrides', () => {
    const configuration = makeMemoryConfiguration({
      entries: [
        { key: 'required-key', value: 'x' },
        { key: 'typed-key', value: 5 },
      ],
    })
    const result = validateConfiguration(configuration, schema, [{ key: 'typed-key', value: 5 }])
    expect(result).toEqual({ valid: true, issues: [] })
  })

  it('detects a required-value-missing issue', () => {
    const configuration = makeMemoryConfiguration({ entries: [] })
    const result = validateConfiguration(configuration, schema, [])
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'required-value-missing' && issue.key === 'required-key')).toBe(true)
  })

  it('detects an invalid-value issue when a value does not match its schema type', () => {
    const configuration = makeMemoryConfiguration({
      entries: [
        { key: 'required-key', value: 'x' },
        { key: 'typed-key', value: 'not-a-number' },
      ],
    })
    const result = validateConfiguration(configuration, schema, [])
    expect(result.issues.some((issue) => issue.type === 'invalid-value' && issue.key === 'typed-key')).toBe(true)
  })

  it('detects a duplicate-key issue in the given override entries', () => {
    const configuration = makeMemoryConfiguration({ entries: [{ key: 'required-key', value: 'x' }] })
    const overrideEntries = [
      { key: 'typed-key', value: 1 },
      { key: 'typed-key', value: 2 },
    ]
    const result = validateConfiguration(configuration, schema, overrideEntries)
    expect(result.issues.some((issue) => issue.type === 'duplicate-key' && issue.key === 'typed-key')).toBe(true)
  })

  it('detects an unsupported-override issue for a key with allowOverride: false', () => {
    const configuration = makeMemoryConfiguration({ entries: [{ key: 'required-key', value: 'x' }] })
    const result = validateConfiguration(configuration, schema, [{ key: 'locked-key', value: true }])
    expect(result.issues.some((issue) => issue.type === 'unsupported-override' && issue.key === 'locked-key')).toBe(true)
  })

  it('detects an unsupported-override issue for a key not present in the schema at all', () => {
    const configuration = makeMemoryConfiguration({ entries: [{ key: 'required-key', value: 'x' }] })
    const result = validateConfiguration(configuration, schema, [{ key: 'unknown-key', value: 1 }])
    expect(result.issues.some((issue) => issue.type === 'unsupported-override' && issue.key === 'unknown-key')).toBe(true)
  })
})

describe('validateConfigurationProfile', () => {
  it('reports valid: true for a well-formed profile', () => {
    const profile = makeConfigurationProfile({ entries: [{ key: 'a', value: 1 }] })
    expect(validateConfigurationProfile(profile)).toEqual({ valid: true, issues: [] })
  })

  it('detects an empty id', () => {
    const profile = makeConfigurationProfile({ id: '' })
    expect(validateConfigurationProfile(profile).valid).toBe(false)
  })

  it('detects an empty name', () => {
    const profile = makeConfigurationProfile({ name: '' })
    expect(validateConfigurationProfile(profile).valid).toBe(false)
  })

  it('detects duplicate keys within the profile entries', () => {
    const profile = makeConfigurationProfile({
      entries: [
        { key: 'a', value: 1 },
        { key: 'a', value: 2 },
      ],
    })
    const result = validateConfigurationProfile(profile)
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'duplicate-key' && issue.key === 'a')).toBe(true)
  })
})
