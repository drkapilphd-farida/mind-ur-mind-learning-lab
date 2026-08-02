import { describe, expect, it } from 'vitest'
import { createConfiguredProviderHealthChecker } from './ConfiguredProviderHealthChecker'
import type { ProviderCredentialResolver } from '@/features/ai-provider-configuration/contracts'

const fixedClock = { now: () => '2026-01-01T00:00:00.000Z' }

describe('ConfiguredProviderHealthChecker', () => {
  it('reports mock as healthy without consulting the credential resolver', async () => {
    const credentialResolver: ProviderCredentialResolver = { hasCredentials: () => false }
    const checker = createConfiguredProviderHealthChecker(credentialResolver, fixedClock)
    const health = await checker.checkHealth('mock')
    expect(health).toEqual({ providerId: 'mock', state: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' })
  })

  it('reports unavailable for a real provider with no credentials', async () => {
    const credentialResolver: ProviderCredentialResolver = { hasCredentials: () => false }
    const checker = createConfiguredProviderHealthChecker(credentialResolver, fixedClock)
    const health = await checker.checkHealth('openai')
    expect(health.state).toBe('unavailable')
    expect(health.message).toContain('no credentials')
  })

  it('reports healthy for a real provider with credentials, without making a network call', async () => {
    const credentialResolver: ProviderCredentialResolver = { hasCredentials: () => true }
    const checker = createConfiguredProviderHealthChecker(credentialResolver, fixedClock)
    const health = await checker.checkHealth('claude')
    expect(health.state).toBe('healthy')
    expect(health.message).toContain('No live network check was performed')
  })
})
