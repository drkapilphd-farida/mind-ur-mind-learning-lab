import { describe, expect, it } from 'vitest'
import { computeExpiresAt } from './conversationTtl'

describe('computeExpiresAt', () => {
  it('critical priority expires in 24 hours', () => {
    expect(computeExpiresAt('2026-01-01T00:00:00.000Z', 'critical')).toBe('2026-01-02T00:00:00.000Z')
  })

  it('background priority expires in 168 hours (1 week)', () => {
    expect(computeExpiresAt('2026-01-01T00:00:00.000Z', 'background')).toBe('2026-01-08T00:00:00.000Z')
  })

  it('a more urgent priority always expires sooner than a less urgent one', () => {
    const critical = computeExpiresAt('2026-01-01T00:00:00.000Z', 'critical')
    const background = computeExpiresAt('2026-01-01T00:00:00.000Z', 'background')
    expect(critical < background).toBe(true)
  })
})
