import { describe, expect, it } from 'vitest'
import {
  generateSustainedFocusTick,
  nextSustainedFocusTickDelayMs,
  pickSustainedFocusDurationMs,
  pickSustainedFocusTargetShape,
  sustainedFocusStageFor,
} from './sustainedFocus'
import {
  SUSTAINED_FOCUS_MAX_DURATION_MS,
  SUSTAINED_FOCUS_MAX_TICK_MS,
  SUSTAINED_FOCUS_MIN_DURATION_MS,
  SUSTAINED_FOCUS_MIN_TICK_MS,
  SUSTAINED_FOCUS_MOVEMENT_FROM_STAGE,
  SUSTAINED_FOCUS_STAGE_COUNT,
} from './focusTimingConfig'

describe('pickSustainedFocusDurationMs', () => {
  it('FIX-05 — real duration always lands within the real "approximately 30-45 seconds" window', () => {
    for (let seed = 0; seed < 30; seed++) {
      const duration = pickSustainedFocusDurationMs(seed)
      expect(duration).toBeGreaterThanOrEqual(SUSTAINED_FOCUS_MIN_DURATION_MS)
      expect(duration).toBeLessThanOrEqual(SUSTAINED_FOCUS_MAX_DURATION_MS)
    }
  })
})

describe('sustainedFocusStageFor', () => {
  it('Sprint-1.5 FIX-05/FIX-07 — real elapsed fraction always resolves to one of the real 7 stages', () => {
    for (let step = 0; step <= 20; step++) {
      const stage = sustainedFocusStageFor(step / 20)
      expect(stage).toBeGreaterThanOrEqual(0)
      expect(stage).toBeLessThan(SUSTAINED_FOCUS_STAGE_COUNT)
    }
  })

  it('never regresses to an earlier real stage as real elapsed fraction rises', () => {
    let previousStage = 0
    for (let step = 0; step <= 100; step++) {
      const stage = sustainedFocusStageFor(step / 100)
      expect(stage).toBeGreaterThanOrEqual(previousStage)
      previousStage = stage
    }
  })
})

describe('nextSustainedFocusTickDelayMs', () => {
  it('every real tick delay stays within the real randomized tick window', () => {
    for (let tickIndex = 0; tickIndex < 20; tickIndex++) {
      const delay = nextSustainedFocusTickDelayMs(7, tickIndex, 0.1)
      expect(delay).toBeGreaterThanOrEqual(SUSTAINED_FOCUS_MIN_TICK_MS)
      expect(delay).toBeLessThanOrEqual(SUSTAINED_FOCUS_MAX_TICK_MS)
    }
  })

  it('Sprint-1.5 FIX-05 — real density stages genuinely speed up the real tick cadence over time', () => {
    const earlyDelays = Array.from({ length: 30 }, (_, tickIndex) => nextSustainedFocusTickDelayMs(3, tickIndex, 0))
    const laterDelays = Array.from({ length: 30 }, (_, tickIndex) => nextSustainedFocusTickDelayMs(3, tickIndex, 0.4))
    const average = (values: number[]): number => values.reduce((a, b) => a + b, 0) / values.length
    expect(average(laterDelays)).toBeLessThan(average(earlyDelays))
  })
})

describe('generateSustainedFocusTick', () => {
  it('"the primary task remains unchanged" — a real target tick always uses the real fixed target shape', () => {
    const targetShape = pickSustainedFocusTargetShape(1)
    for (let tickIndex = 0; tickIndex < 40; tickIndex++) {
      const tick = generateSustainedFocusTick(targetShape, tickIndex, 0.1, 2)
      if (tick.isTarget) expect(tick.object.shape).toBe(targetShape)
      else expect(tick.object.shape).not.toBe(targetShape)
    }
  })

  it('Sprint-1.5 FIX-01/FIX-07 — real distraction dimensions only turn on at their own real stage, never before', () => {
    const targetShape = pickSustainedFocusTargetShape(3)
    const belowMovementFraction = (SUSTAINED_FOCUS_MOVEMENT_FROM_STAGE - 0.5) / SUSTAINED_FOCUS_STAGE_COUNT
    for (let tickIndex = 0; tickIndex < 40; tickIndex++) {
      const tick = generateSustainedFocusTick(targetShape, tickIndex, belowMovementFraction, 5)
      expect(tick.isMoving).toBe(false)
      expect(tick.isBlinking).toBe(false)
      expect(tick.midTickColor).toBeUndefined()
      expect(tick.clutterObject).toBeUndefined()
    }
  })

  it('a real clutter object, when present, is never itself the real target', () => {
    const targetShape = pickSustainedFocusTargetShape(9)
    for (let tickIndex = 0; tickIndex < 60; tickIndex++) {
      const tick = generateSustainedFocusTick(targetShape, tickIndex, 0.99, 11)
      if (tick.clutterObject !== undefined) expect(tick.clutterObject.shape).not.toBe(targetShape)
    }
  })

  it('real cumulative dimensions are all active together in the real final stage', () => {
    const targetShape = pickSustainedFocusTargetShape(13)
    const flags = { moving: false, blinking: false, colorShift: false, clutter: false }
    for (let tickIndex = 0; tickIndex < 80; tickIndex++) {
      const tick = generateSustainedFocusTick(targetShape, tickIndex, 0.99, 21)
      if (tick.isMoving) flags.moving = true
      if (tick.isBlinking) flags.blinking = true
      if (tick.midTickColor !== undefined) flags.colorShift = true
      if (tick.clutterObject !== undefined) flags.clutter = true
    }
    expect(flags.moving).toBe(true)
    expect(flags.blinking).toBe(true)
    expect(flags.colorShift).toBe(true)
    expect(flags.clutter).toBe(true)
  })
})
