import { describe, expect, it } from 'vitest'
import { AdaptiveMemoryCoach } from './adaptiveMemoryCoach'

describe('AdaptiveMemoryCoach', () => {
  it('FIX-05 — starts at medium confidence with no real evidence yet', () => {
    const coach = new AdaptiveMemoryCoach()
    expect(coach.getConfidence()).toBe('medium')
  })

  it('FIX-02 — several real consecutive correct answers raise confidence to high', () => {
    const coach = new AdaptiveMemoryCoach()
    coach.recordOutcome(true, 500)
    coach.recordOutcome(true, 500)
    coach.recordOutcome(true, 500)
    expect(coach.getConfidence()).toBe('high')
  })

  it('FIX-04 — Comfort Zone Protection: repeated real mistakes always win, even after a prior strong streak', () => {
    const coach = new AdaptiveMemoryCoach()
    coach.recordOutcome(true, 500)
    coach.recordOutcome(true, 500)
    coach.recordOutcome(true, 500)
    coach.recordOutcome(false, 500)
    coach.recordOutcome(false, 500)
    expect(coach.getConfidence()).toBe('low')
  })

  it('FIX-02/FIX-03 — high confidence increases items and richness, never decreases them', () => {
    const coach = new AdaptiveMemoryCoach()
    coach.recordOutcome(true, 400)
    coach.recordOutcome(true, 400)
    coach.recordOutcome(true, 400)
    const adjustment = coach.getDifficultyAdjustment()
    expect(adjustment.itemCountDelta).toBeGreaterThan(0)
    expect(adjustment.richerContent).toBe(true)
    expect(adjustment.observationMultiplier).toBeLessThan(1)
  })

  it('FIX-04 — low confidence reduces items, never increases them ("never punish the learner" means never harder)', () => {
    const coach = new AdaptiveMemoryCoach()
    coach.recordOutcome(false, 500)
    coach.recordOutcome(false, 500)
    const adjustment = coach.getDifficultyAdjustment()
    expect(adjustment.itemCountDelta).toBeLessThan(0)
    expect(adjustment.richerContent).toBe(false)
    expect(adjustment.observationMultiplier).toBeGreaterThan(1)
  })

  it('never produces a dramatic jump — every real adjustment stays inside the shared ±20% timing band', () => {
    const coach = new AdaptiveMemoryCoach()
    for (let i = 0; i < 10; i++) coach.recordOutcome(true, 400)
    const adjustment = coach.getDifficultyAdjustment()
    expect(adjustment.observationMultiplier).toBeGreaterThanOrEqual(0.8)
    expect(adjustment.observationMultiplier).toBeLessThanOrEqual(1.2)
  })

  it('FIX-08 — real evidence summary reflects actual recorded behaviour, not a fabricated score', () => {
    const coach = new AdaptiveMemoryCoach()
    coach.recordOutcome(true, 500)
    coach.recordHesitation()
    const evidence = coach.getEvidenceSummary()
    expect(evidence.totalOutcomes).toBe(1)
    expect(evidence.hesitationCount).toBe(1)
    expect(evidence.averageResponseMs).toBe(500)
  })
})
