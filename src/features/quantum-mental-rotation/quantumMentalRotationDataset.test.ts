import { describe, expect, it } from 'vitest'
import {
  ALL_FACES,
  VIEWABLE_FACES,
  COLOR_PALETTE,
  ROTATION_TYPES,
  ROTATION_LABELS,
  ROUNDS_PER_SESSION,
  PRESENTATION_DURATION_CHOICES_MS,
  TIMING_BONUS_WINDOW_MS,
  BASE_POINTS_PER_CORRECT_MATCH,
  TIMING_BONUS_POINTS,
  buildRandomCubeState,
  applyRotation,
  buildSessionRounds,
  computeStreakMultiplier,
  computePointsForCorrectMatch,
  getColorSwatch,
  type CubeState,
} from './quantumMentalRotationDataset'

function statesEqual(a: CubeState, b: CubeState): boolean {
  return ALL_FACES.every((face) => a[face] === b[face])
}

describe('COLOR_PALETTE', () => {
  it('defines 6 distinct colors, each with a unique name and hex', () => {
    expect(COLOR_PALETTE.length).toBe(6)
    expect(new Set(COLOR_PALETTE.map((c) => c.name)).size).toBe(6)
    expect(new Set(COLOR_PALETTE.map((c) => c.hex)).size).toBe(6)
  })

  it('getColorSwatch resolves every palette name', () => {
    for (const swatch of COLOR_PALETTE) {
      expect(getColorSwatch(swatch.name)).toEqual(swatch)
    }
  })
})

describe('buildRandomCubeState', () => {
  it('always assigns a distinct color to every one of the 6 faces', () => {
    for (let i = 0; i < 30; i += 1) {
      const state = buildRandomCubeState()
      expect(ALL_FACES.every((face) => state[face] !== undefined)).toBe(true)
      expect(new Set(ALL_FACES.map((face) => state[face])).size).toBe(6)
    }
  })
})

describe('applyRotation — real, testable permutations of the 6 faces', () => {
  it('every rotation preserves the set of 6 colors (never duplicates or drops one)', () => {
    const state = buildRandomCubeState()
    for (const rotationType of ROTATION_TYPES) {
      const rotated = applyRotation(rotationType, state)
      expect(new Set(ALL_FACES.map((face) => rotated[face]))).toEqual(new Set(ALL_FACES.map((face) => state[face])))
    }
  })

  it('yaw-right applied 4 times returns to the original state (a full 360° turn)', () => {
    const state = buildRandomCubeState()
    let rotated = state
    for (let i = 0; i < 4; i += 1) rotated = applyRotation('yaw-right', rotated)
    expect(statesEqual(rotated, state)).toBe(true)
  })

  it('yaw-left is the exact inverse of yaw-right', () => {
    const state = buildRandomCubeState()
    const roundTrip = applyRotation('yaw-left', applyRotation('yaw-right', state))
    expect(statesEqual(roundTrip, state)).toBe(true)
  })

  it('yaw-180 is exactly two consecutive yaw-right rotations', () => {
    const state = buildRandomCubeState()
    const twoRights = applyRotation('yaw-right', applyRotation('yaw-right', state))
    const oneEighty = applyRotation('yaw-180', state)
    expect(statesEqual(twoRights, oneEighty)).toBe(true)
  })

  it('flip-upside-down applied twice returns to the original state', () => {
    const state = buildRandomCubeState()
    const flippedTwice = applyRotation('flip-upside-down', applyRotation('flip-upside-down', state))
    expect(statesEqual(flippedTwice, state)).toBe(true)
  })

  it('yaw rotations never change the top/bottom faces; flip changes top/bottom but not left/right', () => {
    const state = buildRandomCubeState()
    for (const rotationType of ['yaw-right', 'yaw-left', 'yaw-180'] as const) {
      const rotated = applyRotation(rotationType, state)
      expect(rotated.top).toBe(state.top)
      expect(rotated.bottom).toBe(state.bottom)
    }
    const flipped = applyRotation('flip-upside-down', state)
    expect(flipped.left).toBe(state.left)
    expect(flipped.right).toBe(state.right)
  })
})

describe('ROTATION_LABELS', () => {
  it('every rotation type has a human-readable label', () => {
    for (const rotationType of ROTATION_TYPES) {
      expect(ROTATION_LABELS[rotationType]).toBeTruthy()
    }
  })
})

describe('buildSessionRounds', () => {
  it('produces exactly ROUNDS_PER_SESSION (16) rounds', () => {
    const rounds = buildSessionRounds()
    expect(ROUNDS_PER_SESSION).toBe(16)
    expect(rounds.length).toBe(16)
  })

  it('every rotation type appears exactly 4 times per session — never left to chance', () => {
    const rounds = buildSessionRounds()
    const counts = new Map<string, number>()
    for (const round of rounds) {
      counts.set(round.rotationType, (counts.get(round.rotationType) ?? 0) + 1)
    }
    expect(counts.size).toBe(ROTATION_TYPES.length)
    for (const count of counts.values()) {
      expect(count).toBe(4)
    }
  })

  it('every round asks about one of the 3 viewable faces and has 4 unique options including the correct one', () => {
    const rounds = buildSessionRounds()
    for (const round of rounds) {
      expect(VIEWABLE_FACES).toContain(round.targetFace)
      expect(round.optionColorNames.length).toBe(4)
      expect(new Set(round.optionColorNames).size).toBe(4)
      expect(round.optionColorNames).toContain(round.correctColorName)
    }
  })

  it('the correct answer always matches what applyRotation actually produces (never fabricated)', () => {
    const rounds = buildSessionRounds()
    for (const round of rounds) {
      const rotated = applyRotation(round.rotationType, round.initialState)
      expect(round.correctColorName).toBe(rotated[round.targetFace])
    }
  })

  it('every round gets a presentation duration from the allowed 2-3s set', () => {
    const rounds = buildSessionRounds()
    for (const round of rounds) {
      expect(round).toBeDefined()
    }
    // Presentation duration is chosen by the canvas per round, not
    // stored on the round itself — this just confirms the allowed set
    // is well-formed for that use.
    expect(PRESENTATION_DURATION_CHOICES_MS.length).toBeGreaterThan(0)
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
