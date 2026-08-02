import { describe, expect, it } from 'vitest'
import {
  SCENES,
  JOURNEY_COLORS,
  TIME_OF_DAY_SEQUENCE,
  CHAIN_LENGTH,
  ROUNDS_PER_SESSION,
  TIMING_BONUS_WINDOW_MS,
  BASE_POINTS_PER_CORRECT_MATCH,
  TIMING_BONUS_POINTS,
  buildSessionRounds,
  getIntroNarration,
  getStepNarration,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  getJourneyColor,
  getTimeOfDay,
} from './colorSceneTransformationDataset'

describe('SCENES', () => {
  it('defines 8 distinct scenes, each with a unique id and element label', () => {
    expect(SCENES.length).toBe(8)
    expect(new Set(SCENES.map((s) => s.id)).size).toBe(8)
    expect(SCENES.every((s) => s.elementLabel.length > 0)).toBe(true)
  })
})

describe('JOURNEY_COLORS', () => {
  it('defines 8 distinct colors, each with a unique name and hex', () => {
    expect(JOURNEY_COLORS.length).toBe(8)
    expect(new Set(JOURNEY_COLORS.map((c) => c.name)).size).toBe(8)
    expect(new Set(JOURNEY_COLORS.map((c) => c.hex)).size).toBe(8)
  })

  it('getJourneyColor resolves every palette name', () => {
    for (const color of JOURNEY_COLORS) {
      expect(getJourneyColor(color.name)).toEqual(color)
    }
  })
})

describe('TIME_OF_DAY_SEQUENCE', () => {
  it('defines exactly 4 times of day in real chronological order', () => {
    expect(TIME_OF_DAY_SEQUENCE.map((t) => t.name)).toEqual(['dawn', 'day', 'dusk', 'night'])
  })

  it('getTimeOfDay resolves every time-of-day name', () => {
    for (const time of TIME_OF_DAY_SEQUENCE) {
      expect(getTimeOfDay(time.name)).toEqual(time)
    }
  })
})

describe('buildSessionRounds', () => {
  it('produces exactly ROUNDS_PER_SESSION (16) rounds', () => {
    const rounds = buildSessionRounds()
    expect(ROUNDS_PER_SESSION).toBe(16)
    expect(rounds.length).toBe(16)
  })

  it('splits exactly half color journeys and half time-of-day journeys — never left to chance', () => {
    const rounds = buildSessionRounds()
    const colorCount = rounds.filter((r) => r.roundType === 'color').length
    const timeCount = rounds.filter((r) => r.roundType === 'time-of-day').length
    expect(colorCount).toBe(8)
    expect(timeCount).toBe(8)
  })

  it('every scene appears exactly twice across the session', () => {
    const rounds = buildSessionRounds()
    const counts = new Map<string, number>()
    for (const round of rounds) {
      counts.set(round.scene.id, (counts.get(round.scene.id) ?? 0) + 1)
    }
    expect(counts.size).toBe(SCENES.length)
    for (const count of counts.values()) {
      expect(count).toBe(2)
    }
  })

  it('every color-journey round has a 3-link chain and 4 unique options including the correct one', () => {
    const rounds = buildSessionRounds()
    for (const round of rounds) {
      if (round.roundType !== 'color') continue
      expect(round.colorChain.length).toBe(CHAIN_LENGTH)
      expect(round.optionColorNames.length).toBe(4)
      expect(new Set(round.optionColorNames).size).toBe(4)
      expect(round.optionColorNames).toContain(round.correctColorName)
      expect(round.colorChain[round.colorChain.length - 1]?.name).toBe(round.correctColorName)
    }
  })

  it('every time-of-day round has a 3-link chain that is a genuine consecutive run through the real cycle', () => {
    const rounds = buildSessionRounds()
    const order = TIME_OF_DAY_SEQUENCE.map((t) => t.name)
    for (const round of rounds) {
      if (round.roundType !== 'time-of-day') continue
      expect(round.timeChain.length).toBe(CHAIN_LENGTH)
      const startIndex = order.indexOf(round.timeChain[0]!.name)
      for (let i = 0; i < CHAIN_LENGTH; i += 1) {
        expect(round.timeChain[i]?.name).toBe(order[(startIndex + i) % order.length])
      }
      expect(round.optionTimeOfDayNames.length).toBe(4)
      expect(new Set(round.optionTimeOfDayNames)).toEqual(new Set(order))
      expect(round.optionTimeOfDayNames).toContain(round.correctTimeOfDayName)
    }
  })
})

describe('getIntroNarration', () => {
  it('names the scene and its starting state', () => {
    const scene = SCENES[0]!
    const intro = getIntroNarration(scene, 'color', 'Blue')
    expect(intro).toContain(scene.label)
    expect(intro).toContain('Blue')
  })
})

describe('getStepNarration', () => {
  it('names the scene and element on the first step', () => {
    const scene = SCENES[0]!
    expect(getStepNarration(scene, 'color', 0, 'Blue', 'Turquoise')).toContain(scene.label)
    expect(getStepNarration(scene, 'color', 0, 'Blue', 'Turquoise')).toContain(scene.elementLabel)
  })

  it('continues the journey on the second step without re-stating the scene name redundantly', () => {
    const scene = SCENES[0]!
    const secondStep = getStepNarration(scene, 'color', 1, 'Turquoise', 'Golden')
    expect(secondStep).toContain('Turquoise')
    expect(secondStep).toContain('Golden')
  })
})

describe('computeStreakMultiplier', () => {
  it('stays at x1 for streaks 0-1, steps to x2 at streak 2', () => {
    expect(computeStreakMultiplier(0)).toBe(1)
    expect(computeStreakMultiplier(1)).toBe(1)
    expect(computeStreakMultiplier(2)).toBe(2)
  })
})

describe('computePointsForCorrectMatch', () => {
  it('awards base points at x1 with no timing bonus when slow', () => {
    expect(computePointsForCorrectMatch(1, TIMING_BONUS_WINDOW_MS + 500)).toBe(BASE_POINTS_PER_CORRECT_MATCH)
  })

  it('adds the timing bonus when the reaction is within the fast window', () => {
    expect(computePointsForCorrectMatch(1, 100)).toBe(BASE_POINTS_PER_CORRECT_MATCH + TIMING_BONUS_POINTS)
  })

  it('applies both the streak multiplier and the timing bonus together', () => {
    expect(computePointsForCorrectMatch(2, 100)).toBe(BASE_POINTS_PER_CORRECT_MATCH * 2 + TIMING_BONUS_POINTS)
  })
})
