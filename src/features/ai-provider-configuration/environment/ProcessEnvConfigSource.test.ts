import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createProcessEnvConfigSource } from './ProcessEnvConfigSource'

const ENV_KEYS = ['AI_ACTIVE_PROVIDER_ID', 'AI_PROVIDER_OPENAI_ENABLED', 'AI_PROVIDER_AZURE_OPENAI_ENABLED']
let originalValues: Record<string, string | undefined> = {}

beforeEach(() => {
  originalValues = {}
  for (const key of ENV_KEYS) {
    originalValues[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalValues[key] === undefined) delete process.env[key]
    else process.env[key] = originalValues[key]
  }
})

describe('ProcessEnvConfigSource', () => {
  it('defaults to mock and every flag disabled when nothing is set', () => {
    const source = createProcessEnvConfigSource()
    expect(source.getActiveProviderId()).toBe('mock')
    expect(Object.values(source.getFeatureFlags()).every((flag) => flag === false)).toBe(true)
  })

  it('reads a valid AI_ACTIVE_PROVIDER_ID', () => {
    process.env.AI_ACTIVE_PROVIDER_ID = 'openai'
    expect(createProcessEnvConfigSource().getActiveProviderId()).toBe('openai')
  })

  it('falls back to mock for an unrecognized AI_ACTIVE_PROVIDER_ID rather than throwing', () => {
    process.env.AI_ACTIVE_PROVIDER_ID = 'not-a-real-provider'
    expect(createProcessEnvConfigSource().getActiveProviderId()).toBe('mock')
  })

  it('reads a per-provider ENABLED flag, including a hyphenated id (azure-openai -> AZURE_OPENAI)', () => {
    process.env.AI_PROVIDER_OPENAI_ENABLED = 'true'
    process.env.AI_PROVIDER_AZURE_OPENAI_ENABLED = 'true'
    const flags = createProcessEnvConfigSource().getFeatureFlags()
    expect(flags.openai).toBe(true)
    expect(flags['azure-openai']).toBe(true)
    expect(flags.claude).toBe(false)
  })

  it('treats anything other than the literal string "true" as disabled', () => {
    process.env.AI_PROVIDER_OPENAI_ENABLED = 'TRUE'
    expect(createProcessEnvConfigSource().getFeatureFlags().openai).toBe(false)
  })
})
