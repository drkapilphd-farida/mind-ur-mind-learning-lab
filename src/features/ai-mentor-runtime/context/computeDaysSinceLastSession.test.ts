import { describe, expect, it } from 'vitest'
import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { computeDaysSinceLastSession } from './computeDaysSinceLastSession'

const FIXED_NOW = (): Date => new Date('2026-01-10T00:00:00.000Z')

function snapshotWithCapturedAt(capturedAt: string): SessionSnapshot {
  return { capturedAt } as SessionSnapshot
}

describe('computeDaysSinceLastSession', () => {
  it('reports null, honestly, for zero real sessions', () => {
    expect(computeDaysSinceLastSession([], FIXED_NOW)).toBeNull()
  })

  it('reports real whole days since the most recent real session, regardless of array order', () => {
    const older = snapshotWithCapturedAt('2026-01-01T00:00:00.000Z')
    const newer = snapshotWithCapturedAt('2026-01-05T00:00:00.000Z')

    expect(computeDaysSinceLastSession([older, newer], FIXED_NOW)).toBe(5)
    expect(computeDaysSinceLastSession([newer, older], FIXED_NOW)).toBe(5)
  })

  it('reports zero for a real session captured earlier today', () => {
    expect(computeDaysSinceLastSession([snapshotWithCapturedAt('2026-01-10T00:00:00.000Z')], FIXED_NOW)).toBe(0)
  })
})
