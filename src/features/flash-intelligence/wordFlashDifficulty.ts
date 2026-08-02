// Word Flash™ Difficulty — maps DifficultyTier to Word Flash timing and
// session parameters, and to the 5 named levels locked in the Flash
// Intelligence Pack™ architecture review (Beginner/Intermediate/Advanced/
// Expert/Master — see §7 of the locked spec). The platform's adaptive engine
// still operates on the full 8-tier DifficultyTier system underneath (same
// promotion/recovery machinery every AIEE exercise uses); the 5 names are a
// display-only grouping for this pack, not a second difficulty system.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type WordFlashDifficultyProfile = {
  tier: DifficultyTier
  flashDurationMs: SpeedMs   // how long the word is visible
  itemsPerSession: number    // words per session — fixed at 20 across the
                              // whole Flash Intelligence Pack™ per the
                              // locked spec (§9), unlike Chunk Reading's
                              // per-tier session length
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const WORD_FLASH_DIFFICULTY_PROFILES: Record<DifficultyTier, WordFlashDifficultyProfile> = {
  beginner: { tier: 'beginner', flashDurationMs: 500, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     flashDurationMs: 400, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  medium:   { tier: 'medium',   flashDurationMs: 300, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  advanced: { tier: 'advanced', flashDurationMs: 250, itemsPerSession: 20, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  expert:   { tier: 'expert',   flashDurationMs: 150, itemsPerSession: 20, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    flashDurationMs: 100, itemsPerSession: 20, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  master:   { tier: 'master',   flashDurationMs: 50,  itemsPerSession: 20, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', flashDurationMs: 300, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getWordFlashProfile(tier: DifficultyTier): WordFlashDifficultyProfile {
  return WORD_FLASH_DIFFICULTY_PROFILES[tier]
}

// ── 5-level display naming (locked spec §7) ────────────────────────────────

export type WordFlashUiLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master'

const TIER_TO_UI_LEVEL: Record<DifficultyTier, WordFlashUiLevel> = {
  beginner: 'Beginner',
  easy: 'Beginner',
  medium: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
  elite: 'Expert',
  master: 'Master',
  adaptive: 'Intermediate',
}

export function wordFlashUiLevel(tier: DifficultyTier): WordFlashUiLevel {
  return TIER_TO_UI_LEVEL[tier]
}

// ── Pace descriptor — makes difficulty progression FEEL different, not
// just measure differently (product polish requirement: "users should
// instantly notice progression"). Purely descriptive text over the same
// real flashDurationMs values above — no new timing mechanic.
const UI_LEVEL_PACE_DESCRIPTOR: Record<WordFlashUiLevel, string> = {
  Beginner: 'Comfortable',
  Intermediate: 'Noticeably faster',
  Advanced: 'Requires concentration',
  Expert: 'Very fast',
  Master: 'Extremely fast',
}

export function wordFlashPaceDescriptor(tier: DifficultyTier): string {
  return UI_LEVEL_PACE_DESCRIPTOR[wordFlashUiLevel(tier)]
}
