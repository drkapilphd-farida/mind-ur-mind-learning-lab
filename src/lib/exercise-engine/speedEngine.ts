// Speed Engine™ — manages all exercise timing tiers.
//
// Generalises the flash-specific FLASH_DURATIONS from Sprint 4C-1 into a
// universal speed system every exercise type can use.
// Sprint 4C-1's adaptiveEngine.ts continues to work unchanged — its
// FLASH_DURATIONS is a subset of the tiers here.

import type { SpeedMs, DifficultyTier } from '@/types/exercise-engine'
import { SPEED_TIERS } from '@/types/exercise-engine'

export { SPEED_TIERS }

// Human-readable label for a given speed in milliseconds
export function getSpeedLabel(speedMs: SpeedMs): string {
  if (speedMs >= 800) return 'Foundation'
  if (speedMs >= 500) return 'Beginner'
  if (speedMs >= 300) return 'Developing'
  if (speedMs >= 150) return 'Advanced'
  if (speedMs >= 80) return 'Expert'
  return 'Elite'
}

// Convert a speed in ms to a difficulty tier label
export function speedToDifficultyTier(speedMs: SpeedMs): DifficultyTier {
  if (speedMs >= 800) return 'beginner'
  if (speedMs >= 400) return 'easy'
  if (speedMs >= 200) return 'medium'
  if (speedMs >= 100) return 'advanced'
  return 'expert'
}

// Move one step faster on the SPEED_TIERS ladder
export function increaseSpeed(current: SpeedMs, minSpeedMs: SpeedMs): SpeedMs {
  const idx = (SPEED_TIERS as readonly SpeedMs[]).indexOf(current)
  const next = SPEED_TIERS[idx + 1]
  if (next === undefined || next < minSpeedMs) return current
  return next
}

// Move one step slower on the SPEED_TIERS ladder
export function decreaseSpeed(current: SpeedMs, maxSpeedMs: SpeedMs): SpeedMs {
  const idx = (SPEED_TIERS as readonly SpeedMs[]).indexOf(current)
  if (idx <= 0) return current
  const prev = SPEED_TIERS[idx - 1]
  if (prev === undefined || prev > maxSpeedMs) return current
  return prev
}

// Check whether a speed is valid (exists in the tier list)
export function isValidSpeed(speedMs: number): speedMs is SpeedMs {
  return (SPEED_TIERS as readonly number[]).includes(speedMs)
}

// Clamp an arbitrary ms value to the nearest valid speed tier
export function clampToValidSpeed(speedMs: number): SpeedMs {
  const sorted = [...SPEED_TIERS].sort((a, b) => Math.abs(a - speedMs) - Math.abs(b - speedMs))
  return sorted[0] as SpeedMs
}
