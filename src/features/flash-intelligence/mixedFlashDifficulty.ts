// Mixed Flash™ Difficulty — the Boss Mission's difficulty is expressed
// entirely through the BETWEEN-session tier (same 8-tier system every
// AIEE exercise uses): how the three stimulus types are weighted, how
// aggressively immediate repeats are avoided ("frequent switching"), and
// — via the exact same tier value handed to the word/number/symbol
// datasets — how long/complex each individual stimulus is. There is no
// additional within-session ramp: unlike Number/Symbol Flash, Mixed
// Flash's own spec describes tier-level behavior only ("Beginner: mostly
// words... Master: fast adaptive switching"), not a staged Challenge
// 1-4/5-8 arc, so none is added.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type MixedFlashStimulusType = 'word' | 'number' | 'symbol'

export type MixedFlashDifficultyProfile = {
  tier: DifficultyTier
  flashDurationMs: SpeedMs
  itemsPerSession: number
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const MIXED_FLASH_DIFFICULTY_PROFILES: Record<DifficultyTier, MixedFlashDifficultyProfile> = {
  beginner: { tier: 'beginner', flashDurationMs: 500, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     flashDurationMs: 400, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  medium:   { tier: 'medium',   flashDurationMs: 300, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  advanced: { tier: 'advanced', flashDurationMs: 250, itemsPerSession: 20, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  expert:   { tier: 'expert',   flashDurationMs: 150, itemsPerSession: 20, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    flashDurationMs: 100, itemsPerSession: 20, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  master:   { tier: 'master',   flashDurationMs: 50,  itemsPerSession: 20, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', flashDurationMs: 300, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getMixedFlashProfile(tier: DifficultyTier): MixedFlashDifficultyProfile {
  return MIXED_FLASH_DIFFICULTY_PROFILES[tier]
}

// ── 5-level display naming ──────────────────────────────────────────────

export type MixedFlashUiLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master'

const TIER_TO_UI_LEVEL: Record<DifficultyTier, MixedFlashUiLevel> = {
  beginner: 'Beginner',
  easy: 'Beginner',
  medium: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
  elite: 'Expert',
  master: 'Master',
  adaptive: 'Intermediate',
}

export function mixedFlashUiLevel(tier: DifficultyTier): MixedFlashUiLevel {
  return TIER_TO_UI_LEVEL[tier]
}

const UI_LEVEL_PACE_DESCRIPTOR: Record<MixedFlashUiLevel, string> = {
  Beginner: 'Comfortable',
  Intermediate: 'Noticeably faster',
  Advanced: 'Requires concentration',
  Expert: 'Very fast',
  Master: 'Extremely fast',
}

export function mixedFlashPaceDescriptor(tier: DifficultyTier): string {
  return UI_LEVEL_PACE_DESCRIPTOR[mixedFlashUiLevel(tier)]
}

// ── Stimulus type distribution + switching behavior per tier ─────────────

export type TypeWeights = Record<MixedFlashStimulusType, number>

// Beginner leans heavily on words (the most familiar recognition task);
// every other tier is balanced across the three types — "frequent
// switching" and "fast adaptive switching" at Advanced/Master come from
// the anti-repeat bias below, not from a further weight skew, since the
// mission brief describes those tiers as balanced-but-unpredictable, not
// type-skewed.
const TIER_TYPE_WEIGHTS: Record<DifficultyTier, TypeWeights> = {
  beginner: { word: 0.7, number: 0.15, symbol: 0.15 },
  easy:     { word: 0.55, number: 0.225, symbol: 0.225 },
  medium:   { word: 0.34, number: 0.33, symbol: 0.33 },
  advanced: { word: 0.34, number: 0.33, symbol: 0.33 },
  expert:   { word: 0.34, number: 0.33, symbol: 0.33 },
  elite:    { word: 0.34, number: 0.33, symbol: 0.33 },
  master:   { word: 0.34, number: 0.33, symbol: 0.33 },
  adaptive: { word: 0.34, number: 0.33, symbol: 0.33 },
}

export function typeWeightsForTier(tier: DifficultyTier): TypeWeights {
  return TIER_TYPE_WEIGHTS[tier]
}

// Whether the sequence generator should actively discourage the same
// stimulus type appearing twice in a row — "frequent switching" at
// Advanced and "fast adaptive switching" at Master.
const TIER_AVOID_IMMEDIATE_REPEAT: Record<DifficultyTier, boolean> = {
  beginner: false,
  easy: false,
  medium: false,
  advanced: true,
  expert: true,
  elite: true,
  master: true,
  adaptive: true,
}

export function shouldAvoidImmediateRepeat(tier: DifficultyTier): boolean {
  return TIER_AVOID_IMMEDIATE_REPEAT[tier]
}
