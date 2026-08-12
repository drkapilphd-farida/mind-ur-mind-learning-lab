import { describe, expect, it } from 'vitest'
import {
  FLUID_ENERGY_ROUNDS,
  FLUID_ENERGY_ROUNDS_PER_SESSION,
  PERFECT_ROUND_STABILITY_THRESHOLD_PERCENT,
  clamp,
  computeStabilityPercent,
  directionNeededToCorrect,
  isInHarmony,
  isPerfectRound,
  stepFluidEnergy,
  type FluidEnergySimulationState,
} from './fluidEnergyEngine'

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('clamp', () => {
  it('clamps below the minimum', () => {
    expect(clamp(-50, -10, 10)).toBe(-10)
  })
  it('clamps above the maximum', () => {
    expect(clamp(50, -10, 10)).toBe(10)
  })
  it('passes through values already in range', () => {
    expect(clamp(3, -10, 10)).toBe(3)
  })
})

describe('FLUID_ENERGY_ROUNDS', () => {
  it('has exactly 5 rounds, matching FLUID_ENERGY_ROUNDS_PER_SESSION', () => {
    expect(FLUID_ENERGY_ROUNDS).toHaveLength(FLUID_ENERGY_ROUNDS_PER_SESSION)
  })

  it('fluctuation strength climbs every round (harder drift to fight)', () => {
    for (let i = 1; i < FLUID_ENERGY_ROUNDS.length; i++) {
      expect(FLUID_ENERGY_ROUNDS[i]!.fluctuationStrength).toBeGreaterThan(FLUID_ENERGY_ROUNDS[i - 1]!.fluctuationStrength)
    }
  })

  it('the tolerance band narrows every round (less room for error)', () => {
    for (let i = 1; i < FLUID_ENERGY_ROUNDS.length; i++) {
      expect(FLUID_ENERGY_ROUNDS[i]!.toleranceBand).toBeLessThan(FLUID_ENERGY_ROUNDS[i - 1]!.toleranceBand)
    }
  })

  it("the player's own correction strength never changes across rounds", () => {
    const first = FLUID_ENERGY_ROUNDS[0]!.correctionStrength
    for (const round of FLUID_ENERGY_ROUNDS) {
      expect(round.correctionStrength).toBe(first)
    }
  })
})

describe('stepFluidEnergy', () => {
  const config = FLUID_ENERGY_ROUNDS[0]!

  it('drifts away from center over many ticks with no correction and one-sided jitter', () => {
    let state: FluidEnergySimulationState = { balance: 0, velocity: 0 }
    const alwaysPositive = (): number => 1
    for (let i = 0; i < 40; i++) {
      state = stepFluidEnergy(state, 0, config, alwaysPositive)
    }
    expect(state.balance).toBeGreaterThan(50)
  })

  it('an ideal player reacting to the current tilt keeps the balance bounded under genuine two-sided jitter', () => {
    const randomFn = createSeededRandom(42)
    let state: FluidEnergySimulationState = { balance: 0, velocity: 0 }
    for (let i = 0; i < 200; i++) {
      // A "perfect" player reads the current balance and always presses
      // whichever direction would correct it — the same logic
      // directionNeededToCorrect exposes for the real UI's guidance copy.
      const input = directionNeededToCorrect(state.balance)
      state = stepFluidEnergy(state, input, config, randomFn)
    }
    expect(Math.abs(state.balance)).toBeLessThan(config.toleranceBand + 15)
  })

  it('never exceeds the ±100 balance bound even under sustained maximum drift', () => {
    let state: FluidEnergySimulationState = { balance: 0, velocity: 0 }
    const alwaysMax = (): number => 1
    for (let i = 0; i < 500; i++) {
      state = stepFluidEnergy(state, 0, config, alwaysMax)
    }
    expect(state.balance).toBeLessThanOrEqual(100)
    expect(state.balance).toBeGreaterThanOrEqual(-100)
  })

  it('is deterministic given the same seeded random sequence', () => {
    const randomFn = createSeededRandom(7)
    const randomFn2 = createSeededRandom(7)
    let stateA: FluidEnergySimulationState = { balance: 5, velocity: 1 }
    let stateB: FluidEnergySimulationState = { balance: 5, velocity: 1 }
    for (let i = 0; i < 20; i++) {
      stateA = stepFluidEnergy(stateA, 1, config, randomFn)
      stateB = stepFluidEnergy(stateB, 1, config, randomFn2)
    }
    expect(stateA).toEqual(stateB)
  })

  it('velocity settles rather than oscillating forever once drift and correction roughly cancel', () => {
    let state: FluidEnergySimulationState = { balance: 0, velocity: 20 }
    const zeroJitter = (): number => 0.5 // (0.5 - 0.5) * 2 = 0 jitter
    for (let i = 0; i < 30; i++) {
      state = stepFluidEnergy(state, 0, config, zeroJitter)
    }
    expect(Math.abs(state.velocity)).toBeLessThan(0.5)
  })
})

describe('isInHarmony', () => {
  it('is true exactly at the tolerance boundary', () => {
    expect(isInHarmony(30, { toleranceBand: 30 })).toBe(true)
    expect(isInHarmony(-30, { toleranceBand: 30 })).toBe(true)
  })
  it('is false just past the tolerance boundary', () => {
    expect(isInHarmony(30.1, { toleranceBand: 30 })).toBe(false)
    expect(isInHarmony(-30.1, { toleranceBand: 30 })).toBe(false)
  })
  it('is true at perfect center', () => {
    expect(isInHarmony(0, { toleranceBand: 5 })).toBe(true)
  })
})

describe('directionNeededToCorrect', () => {
  it('needs a positive correction when balance has drifted negative', () => {
    expect(directionNeededToCorrect(-40)).toBe(1)
  })
  it('needs a negative correction when balance has drifted positive', () => {
    expect(directionNeededToCorrect(40)).toBe(-1)
  })
  it('needs no correction when already essentially centered', () => {
    expect(directionNeededToCorrect(0)).toBe(0)
    expect(directionNeededToCorrect(0.2)).toBe(0)
    expect(directionNeededToCorrect(-0.2)).toBe(0)
  })
})

describe('computeStabilityPercent', () => {
  it('computes a rounded percentage of in-harmony ticks', () => {
    expect(computeStabilityPercent(45, 90)).toBe(50)
    expect(computeStabilityPercent(90, 90)).toBe(100)
    expect(computeStabilityPercent(0, 90)).toBe(0)
  })
  it('returns 0 for a zero-tick round rather than dividing by zero', () => {
    expect(computeStabilityPercent(0, 0)).toBe(0)
  })
})

describe('isPerfectRound', () => {
  it('matches the documented threshold exactly', () => {
    expect(isPerfectRound(PERFECT_ROUND_STABILITY_THRESHOLD_PERCENT)).toBe(true)
    expect(isPerfectRound(PERFECT_ROUND_STABILITY_THRESHOLD_PERCENT - 1)).toBe(false)
  })
  it('a full 100% stability round is always perfect', () => {
    expect(isPerfectRound(100)).toBe(true)
  })
})
