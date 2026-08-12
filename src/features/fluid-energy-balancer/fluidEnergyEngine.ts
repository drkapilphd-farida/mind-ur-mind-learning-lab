// Fluid Energy Balancer™ — pure dual-scale balancing physics, deliberately
// kept free of React so the actual simulation is unit-testable without a
// browser. Two opposing energetic forces — Heavy Earth & Gold (negative
// balance) and Light Air & Water (positive balance) — pull against a
// single `balance` value; the player holds a direction to counteract
// whichever way it's currently drifting, fighting simulated atmospheric
// "fluctuation" noise every tick.
export type BalanceDirection = -1 | 0 | 1

export type FluidEnergySimulationState = {
  balance: number
  velocity: number
}

export type FluidEnergyRoundConfig = {
  fluctuationStrength: number
  correctionStrength: number
  toleranceBand: number
  durationMs: number
}

export const FLUID_ENERGY_ROUNDS_PER_SESSION = 5
export const FLUID_ENERGY_TICK_MS = 100

// Escalating difficulty across the 5 rounds — fluctuation strength climbs
// (harder drift to fight) while the tolerance band narrows (less room for
// error), exactly matching the spec's own "increasing stability
// challenges and tighter equilibrium tolerances." correctionStrength
// stays fixed across rounds — the player's own input power never
// changes, only the world gets harder to hold steady, so a session
// genuinely gets more difficult round over round rather than the player
// simply "getting stronger."
export const FLUID_ENERGY_ROUNDS: readonly FluidEnergyRoundConfig[] = [
  { fluctuationStrength: 2.2, correctionStrength: 3.2, toleranceBand: 30, durationMs: 9000 },
  { fluctuationStrength: 2.6, correctionStrength: 3.2, toleranceBand: 25, durationMs: 9500 },
  { fluctuationStrength: 3.0, correctionStrength: 3.2, toleranceBand: 20, durationMs: 10000 },
  { fluctuationStrength: 3.4, correctionStrength: 3.2, toleranceBand: 16, durationMs: 10500 },
  { fluctuationStrength: 3.8, correctionStrength: 3.2, toleranceBand: 12, durationMs: 11000 },
]

const VELOCITY_DAMPING = 0.82
const MAX_VELOCITY = 9
const MAX_BALANCE = 100

// A round counts as "perfect" (streak-worthy) when the player held
// harmony for at least this fraction of the round's own duration.
export const PERFECT_ROUND_STABILITY_THRESHOLD_PERCENT = 90

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// Advances the simulation by exactly one FLUID_ENERGY_TICK_MS step.
// `randomFn` is injectable (defaults to Math.random) purely so tests can
// drive the "atmospheric" jitter deterministically. Velocity decays each
// tick (VELOCITY_DAMPING) so the beam settles rather than oscillating
// forever once the drift and correction forces roughly cancel out —
// without damping, a perfectly balanced correction would still leave the
// beam swinging indefinitely on its own accumulated momentum.
export function stepFluidEnergy(
  state: FluidEnergySimulationState,
  inputDirection: BalanceDirection,
  config: FluidEnergyRoundConfig,
  randomFn: () => number = Math.random,
): FluidEnergySimulationState {
  const jitter = (randomFn() - 0.5) * 2 * config.fluctuationStrength
  const correction = inputDirection * config.correctionStrength
  const nextVelocity = clamp(state.velocity * VELOCITY_DAMPING + jitter + correction, -MAX_VELOCITY, MAX_VELOCITY)
  const nextBalance = clamp(state.balance + nextVelocity, -MAX_BALANCE, MAX_BALANCE)
  return { balance: nextBalance, velocity: nextVelocity }
}

export function isInHarmony(balance: number, config: Pick<FluidEnergyRoundConfig, 'toleranceBand'>): boolean {
  return Math.abs(balance) <= config.toleranceBand
}

// Which direction would presently correct the balance back toward zero —
// 0 when already within a hair's width of center. Exposed as its own
// pure helper both for on-screen guidance copy and for tests to assert
// against, rather than duplicating the sign logic in the UI layer.
export function directionNeededToCorrect(balance: number): BalanceDirection {
  if (balance > 0.5) return -1
  if (balance < -0.5) return 1
  return 0
}

export function computeStabilityPercent(stableTicks: number, totalTicks: number): number {
  if (totalTicks <= 0) return 0
  return Math.round((stableTicks / totalTicks) * 100)
}

export function isPerfectRound(stabilityPercent: number): boolean {
  return stabilityPercent >= PERFECT_ROUND_STABILITY_THRESHOLD_PERCENT
}
