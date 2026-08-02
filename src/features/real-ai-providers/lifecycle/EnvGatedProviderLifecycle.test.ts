import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createEnvGatedProviderLifecycle } from './EnvGatedProviderLifecycle'
import { MissingProviderConfigurationError } from '../errors'

const ENV_VAR = 'TEST_PROVIDER_API_KEY'
let original: string | undefined

beforeEach(() => {
  original = process.env[ENV_VAR]
  delete process.env[ENV_VAR]
})

afterEach(() => {
  if (original === undefined) delete process.env[ENV_VAR]
  else process.env[ENV_VAR] = original
})

describe('EnvGatedProviderLifecycle', () => {
  it('starts not ready', () => {
    expect(createEnvGatedProviderLifecycle('test-provider', ENV_VAR).isReady()).toBe(false)
  })

  it('initialize() throws MissingProviderConfigurationError when the env var is absent', async () => {
    const lifecycle = createEnvGatedProviderLifecycle('test-provider', ENV_VAR)
    await expect(lifecycle.initialize()).rejects.toThrow(MissingProviderConfigurationError)
    expect(lifecycle.isReady()).toBe(false)
  })

  it('initialize() succeeds and becomes ready when the env var is present', async () => {
    process.env[ENV_VAR] = 'some-key-value'
    const lifecycle = createEnvGatedProviderLifecycle('test-provider', ENV_VAR)
    await lifecycle.initialize()
    expect(lifecycle.isReady()).toBe(true)
  })

  it('never makes a network call — initialize() only checks presence', async () => {
    process.env[ENV_VAR] = 'some-key-value'
    const lifecycle = createEnvGatedProviderLifecycle('test-provider', ENV_VAR)
    await expect(lifecycle.initialize()).resolves.toBeUndefined()
  })

  it('shutdown() sets isReady back to false', async () => {
    process.env[ENV_VAR] = 'some-key-value'
    const lifecycle = createEnvGatedProviderLifecycle('test-provider', ENV_VAR)
    await lifecycle.initialize()
    await lifecycle.shutdown()
    expect(lifecycle.isReady()).toBe(false)
  })
})
