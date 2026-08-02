import { describe, expect, it } from 'vitest'
import { computeProgressivePaceMultiplier } from './computeProgressivePace'

describe('computeProgressivePaceMultiplier', () => {
  it('starts at the real warm-up multiplier (slower) for the first real item', () => {
    const result = computeProgressivePaceMultiplier({ itemIndex: 0, totalItems: 30, previousDwellMs: null, previousBaseDurationMs: null, trend: 'stable' })
    expect(result.multiplier).toBeCloseTo(1.15, 2)
    expect(result.hesitationDetected).toBe(false)
  })

  it('ends near the real adaptive-challenge multiplier (faster) for the last real item', () => {
    const result = computeProgressivePaceMultiplier({ itemIndex: 29, totalItems: 30, previousDwellMs: 800, previousBaseDurationMs: 900, trend: 'stable' })
    expect(result.multiplier).toBeCloseTo(0.8, 2)
  })

  it('gradually decreases across the real sequence — never a sudden jump', () => {
    const early = computeProgressivePaceMultiplier({ itemIndex: 5, totalItems: 30, previousDwellMs: 800, previousBaseDurationMs: 900, trend: 'stable' })
    const middle = computeProgressivePaceMultiplier({ itemIndex: 15, totalItems: 30, previousDwellMs: 800, previousBaseDurationMs: 900, trend: 'stable' })
    const late = computeProgressivePaceMultiplier({ itemIndex: 25, totalItems: 30, previousDwellMs: 800, previousBaseDurationMs: 900, trend: 'stable' })
    expect(early.multiplier).toBeGreaterThan(middle.multiplier)
    expect(middle.multiplier).toBeGreaterThan(late.multiplier)
  })

  it('detects real hesitation when the previous real dwell time far exceeds its own real target', () => {
    const result = computeProgressivePaceMultiplier({ itemIndex: 10, totalItems: 30, previousDwellMs: 2000, previousBaseDurationMs: 900, trend: 'stable' })
    expect(result.hesitationDetected).toBe(true)
  })

  it('pauses the ramp (never speeds up further) once real hesitation is detected', () => {
    const withoutHesitation = computeProgressivePaceMultiplier({ itemIndex: 25, totalItems: 30, previousDwellMs: 800, previousBaseDurationMs: 900, trend: 'stable' })
    const withHesitation = computeProgressivePaceMultiplier({ itemIndex: 25, totalItems: 30, previousDwellMs: 2000, previousBaseDurationMs: 900, trend: 'stable' })
    expect(withHesitation.multiplier).toBeGreaterThan(withoutHesitation.multiplier)
    expect(withHesitation.multiplier).toBeGreaterThanOrEqual(1)
  })

  it('folds in a real declining trend as an additional slow-down', () => {
    const stable = computeProgressivePaceMultiplier({ itemIndex: 10, totalItems: 30, previousDwellMs: 800, previousBaseDurationMs: 900, trend: 'stable' })
    const declining = computeProgressivePaceMultiplier({ itemIndex: 10, totalItems: 30, previousDwellMs: 800, previousBaseDurationMs: 900, trend: 'declining' })
    expect(declining.multiplier).toBeGreaterThan(stable.multiplier)
  })

  it('folds in a real improving trend as an additional speed-up', () => {
    const stable = computeProgressivePaceMultiplier({ itemIndex: 10, totalItems: 30, previousDwellMs: 800, previousBaseDurationMs: 900, trend: 'stable' })
    const improving = computeProgressivePaceMultiplier({ itemIndex: 10, totalItems: 30, previousDwellMs: 800, previousBaseDurationMs: 900, trend: 'improving' })
    expect(improving.multiplier).toBeLessThan(stable.multiplier)
  })
})
