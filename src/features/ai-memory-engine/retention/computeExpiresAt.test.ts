import { describe, expect, it } from 'vitest'
import { computeExpiresAt } from './computeExpiresAt'

describe('computeExpiresAt', () => {
  it('permanent retention never expires', () => {
    expect(computeExpiresAt('2026-01-01T00:00:00.000Z', 'permanent')).toBeNull()
  })

  it('session retention expires in 4 hours', () => {
    expect(computeExpiresAt('2026-01-01T00:00:00.000Z', 'session')).toBe('2026-01-01T04:00:00.000Z')
  })

  it('daily retention expires in 24 hours', () => {
    expect(computeExpiresAt('2026-01-01T00:00:00.000Z', 'daily')).toBe('2026-01-02T00:00:00.000Z')
  })

  it('weekly retention expires in 168 hours', () => {
    expect(computeExpiresAt('2026-01-01T00:00:00.000Z', 'weekly')).toBe('2026-01-08T00:00:00.000Z')
  })

  it('monthly retention expires in 720 hours (30 days)', () => {
    expect(computeExpiresAt('2026-01-01T00:00:00.000Z', 'monthly')).toBe('2026-01-31T00:00:00.000Z')
  })
})
