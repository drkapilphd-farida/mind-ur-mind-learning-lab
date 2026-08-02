// Number Flash™ Difficulty — maps DifficultyTier to Number Flash timing
// and digit-length parameters, and to the 5 named levels (Beginner/
// Intermediate/Advanced/Expert/Master). Same shape as
// wordFlashDifficulty.ts but intentionally not imported from it — each
// mission owns its own small difficulty module so missions stay
// independent, reusable templates rather than coupled to each other.
//
// Digit length is the difficulty axis: 2 digits at Beginner up to 6 at
// Master, per the locked Number Flash spec.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type NumberFlashDifficultyProfile = {
  tier: DifficultyTier
  digitLength: number
  flashDurationMs: SpeedMs
  itemsPerSession: number
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const NUMBER_FLASH_DIFFICULTY_PROFILES: Record<DifficultyTier, NumberFlashDifficultyProfile> = {
  beginner: { tier: 'beginner', digitLength: 2, flashDurationMs: 500, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     digitLength: 2, flashDurationMs: 400, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  medium:   { tier: 'medium',   digitLength: 3, flashDurationMs: 300, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  advanced: { tier: 'advanced', digitLength: 4, flashDurationMs: 250, itemsPerSession: 20, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  expert:   { tier: 'expert',   digitLength: 5, flashDurationMs: 150, itemsPerSession: 20, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    digitLength: 5, flashDurationMs: 100, itemsPerSession: 20, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  master:   { tier: 'master',   digitLength: 6, flashDurationMs: 50,  itemsPerSession: 20, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', digitLength: 3, flashDurationMs: 300, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getNumberFlashProfile(tier: DifficultyTier): NumberFlashDifficultyProfile {
  return NUMBER_FLASH_DIFFICULTY_PROFILES[tier]
}

// ── 5-level display naming ──────────────────────────────────────────────

export type NumberFlashUiLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master'

const TIER_TO_UI_LEVEL: Record<DifficultyTier, NumberFlashUiLevel> = {
  beginner: 'Beginner',
  easy: 'Beginner',
  medium: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
  elite: 'Expert',
  master: 'Master',
  adaptive: 'Intermediate',
}

export function numberFlashUiLevel(tier: DifficultyTier): NumberFlashUiLevel {
  return TIER_TO_UI_LEVEL[tier]
}

const UI_LEVEL_PACE_DESCRIPTOR: Record<NumberFlashUiLevel, string> = {
  Beginner: 'Comfortable',
  Intermediate: 'Noticeably faster',
  Advanced: 'Requires concentration',
  Expert: 'Very fast',
  Master: 'Extremely fast',
}

export function numberFlashPaceDescriptor(tier: DifficultyTier): string {
  return UI_LEVEL_PACE_DESCRIPTOR[numberFlashUiLevel(tier)]
}
