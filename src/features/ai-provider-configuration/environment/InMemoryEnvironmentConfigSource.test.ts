import { describe, expect, it } from 'vitest'
import { createInMemoryEnvironmentConfigSource } from './InMemoryEnvironmentConfigSource'

describe('InMemoryEnvironmentConfigSource', () => {
  it('defaults to mock with every feature flag disabled', () => {
    const source = createInMemoryEnvironmentConfigSource()
    expect(source.getActiveProviderId()).toBe('mock')
    expect(Object.values(source.getFeatureFlags()).every((flag) => flag === false)).toBe(true)
  })

  it('honors an explicit activeProviderId override', () => {
    const source = createInMemoryEnvironmentConfigSource({ activeProviderId: 'openai' })
    expect(source.getActiveProviderId()).toBe('openai')
  })

  it('honors partial featureFlags overrides, leaving the rest disabled', () => {
    const source = createInMemoryEnvironmentConfigSource({ featureFlags: { openai: true } })
    const flags = source.getFeatureFlags()
    expect(flags.openai).toBe(true)
    expect(flags.claude).toBe(false)
  })
})
