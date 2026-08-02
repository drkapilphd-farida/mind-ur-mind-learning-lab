import { describe, expect, it } from 'vitest'
import { createPolicyRegistry } from './DefaultPolicyRegistry'
import { PolicyNotFoundError } from './PolicyNotFoundError'
import { makeConfigurationProfile } from '../testFixtures'

describe('DefaultPolicyRegistry', () => {
  it('resolvePolicy() returns null for an unregistered policy', () => {
    const registry = createPolicyRegistry()
    expect(registry.resolvePolicy('does-not-exist')).toBeNull()
  })

  it('registerPolicy() then resolvePolicy() returns the same profile', () => {
    const registry = createPolicyRegistry()
    const profile = makeConfigurationProfile()
    registry.registerPolicy(profile)
    expect(registry.resolvePolicy(profile.id)).toEqual(profile)
  })

  it('registerPolicy() with the same id replaces the previous registration', () => {
    const registry = createPolicyRegistry()
    registry.registerPolicy(makeConfigurationProfile({ name: 'First' }))
    registry.registerPolicy(makeConfigurationProfile({ name: 'Second' }))
    expect(registry.resolvePolicy('profile-1')?.name).toBe('Second')
  })

  it('listActivePolicies() returns every registered policy', () => {
    const registry = createPolicyRegistry()
    registry.registerPolicy(makeConfigurationProfile({ id: 'a' }))
    registry.registerPolicy(makeConfigurationProfile({ id: 'b' }))
    expect(registry.listActivePolicies().map((p) => p.id).sort()).toEqual(['a', 'b'])
  })

  it('listActivePolicies() returns an empty array when nothing is registered', () => {
    const registry = createPolicyRegistry()
    expect(registry.listActivePolicies()).toEqual([])
  })

  it('overridePolicy() merges new entries into an existing registered policy and re-registers it', () => {
    const registry = createPolicyRegistry()
    registry.registerPolicy(makeConfigurationProfile({ entries: [{ key: 'a', value: 1 }] }))

    const updated = registry.overridePolicy('profile-1', [{ key: 'b', value: 2 }])
    expect(updated.entries).toEqual([
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
    ])
    expect(registry.resolvePolicy('profile-1')).toEqual(updated)
  })

  it('overridePolicy() overrides an existing key rather than duplicating it', () => {
    const registry = createPolicyRegistry()
    registry.registerPolicy(makeConfigurationProfile({ entries: [{ key: 'a', value: 1 }] }))
    const updated = registry.overridePolicy('profile-1', [{ key: 'a', value: 2 }])
    expect(updated.entries).toEqual([{ key: 'a', value: 2 }])
  })

  it('overridePolicy() throws PolicyNotFoundError for an unregistered policy', () => {
    const registry = createPolicyRegistry()
    expect(() => registry.overridePolicy('does-not-exist', [])).toThrow(PolicyNotFoundError)
  })

  it('validatePolicyDefinition() delegates to validateConfigurationProfile', () => {
    const registry = createPolicyRegistry()
    expect(registry.validatePolicyDefinition(makeConfigurationProfile()).valid).toBe(true)
    expect(registry.validatePolicyDefinition(makeConfigurationProfile({ id: '' })).valid).toBe(false)
  })
})
