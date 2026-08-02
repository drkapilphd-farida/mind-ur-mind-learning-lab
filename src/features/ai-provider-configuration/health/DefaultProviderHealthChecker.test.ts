import { describe, expect, it } from 'vitest'
import { createProviderHealthChecker } from './DefaultProviderHealthChecker'

const fixedClock = { now: () => '2026-01-01T00:00:00.000Z' }

describe('DefaultProviderHealthChecker', () => {
  it('reports mock as healthy, using the injected clock', async () => {
    const checker = createProviderHealthChecker(fixedClock)
    const health = await checker.checkHealth('mock')
    expect(health).toEqual({ providerId: 'mock', state: 'healthy', checkedAt: '2026-01-01T00:00:00.000Z' })
  })

  it('honestly reports every real provider as unavailable, with an explanatory message', async () => {
    const checker = createProviderHealthChecker(fixedClock)
    const health = await checker.checkHealth('openai')
    expect(health.state).toBe('unavailable')
    expect(health.message).toContain('openai')
    expect(health.message).toContain('no real provider adapter')
  })
})
