import { describe, expect, it } from 'vitest'
import { computeSmartNotesEngagementScore } from './computeSmartNotesEngagementScore'

describe('computeSmartNotesEngagementScore', () => {
  it('reports a real, perfect score for full completion with zero revisits and zero repeats', () => {
    const score = computeSmartNotesEngagementScore({ sessionId: 's', completionRate: 1, revisitRate: 0, repeatRate: 0, pauseCount: 0, elapsedSeconds: 0 })
    expect(score).toBe(1)
  })

  it('reports a real zero for zero completion with maximal revisits and repeats', () => {
    const score = computeSmartNotesEngagementScore({ sessionId: 's', completionRate: 0, revisitRate: 1, repeatRate: 1, pauseCount: 0, elapsedSeconds: 0 })
    expect(score).toBe(0)
  })

  it('weights completion at 50%, revisit at 30%, repeat at 20%', () => {
    const score = computeSmartNotesEngagementScore({ sessionId: 's', completionRate: 0.5, revisitRate: 0.5, repeatRate: 0.5, pauseCount: 0, elapsedSeconds: 0 })
    expect(score).toBeCloseTo(0.5 * 0.5 + 0.5 * 0.3 + 0.5 * 0.2, 10)
  })

  it('clamps a repeat rate above 1 rather than letting the score go negative', () => {
    const score = computeSmartNotesEngagementScore({ sessionId: 's', completionRate: 0, revisitRate: 0, repeatRate: 3, pauseCount: 0, elapsedSeconds: 0 })
    expect(score).toBeCloseTo(0.3, 10)
    expect(score).toBeGreaterThanOrEqual(0)
  })
})
