import { describe, expect, it } from 'vitest'
import { AdaptiveDifficultyController } from './adaptiveDifficulty'

describe('AdaptiveDifficultyController', () => {
  it('Sprint-1.8 — the real very first round always starts at Level 1 (index 0), before any real outcome exists', () => {
    const controller = new AdaptiveDifficultyController(4)
    expect(controller.currentLevel).toBe(0)
  })

  it('LOCKED RULE — a real strong outcome advances by exactly one real level, never more', () => {
    const controller = new AdaptiveDifficultyController(4)
    controller.recordRoundOutcome(0.9)
    expect(controller.currentLevel).toBe(1)
    controller.recordRoundOutcome(1)
    expect(controller.currentLevel).toBe(2)
  })

  it('AI Adaptive Observation™ — a real poor outcome stabilizes instead of advancing', () => {
    const controller = new AdaptiveDifficultyController(4)
    controller.recordRoundOutcome(1)
    expect(controller.currentLevel).toBe(1)
    controller.recordRoundOutcome(0.3)
    expect(controller.currentLevel).toBe(1)
    expect(controller.stabilizedRounds).toBe(1)
  })

  it('Anti-Frustration System™ — the real effective level never exceeds the real configured maximum', () => {
    const controller = new AdaptiveDifficultyController(2)
    for (let i = 0; i < 10; i++) controller.recordRoundOutcome(1)
    expect(controller.currentLevel).toBe(2)
  })

  it('the real effective level never decreases, even after repeated real poor outcomes', () => {
    const controller = new AdaptiveDifficultyController(4)
    controller.recordRoundOutcome(1)
    controller.recordRoundOutcome(1)
    expect(controller.currentLevel).toBe(2)
    controller.recordRoundOutcome(0)
    controller.recordRoundOutcome(0.1)
    expect(controller.currentLevel).toBe(2)
    expect(controller.stabilizedRounds).toBe(2)
  })

  it('a real borderline accuracy exactly at the threshold stabilizes (never advances on ambiguous performance)', () => {
    const controller = new AdaptiveDifficultyController(4)
    controller.recordRoundOutcome(0.5)
    expect(controller.currentLevel).toBe(0)
    expect(controller.stabilizedRounds).toBe(1)
  })
})
