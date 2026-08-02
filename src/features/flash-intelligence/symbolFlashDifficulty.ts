// Symbol Flash™ Difficulty — two independent axes, both real, deliberately
// not conflated:
//
// 1. Between-session tier (DifficultyTier, same 8-tier system every AIEE
//    exercise uses) — governs base flash speed and which symbol pool a
//    session draws from (simple glyphs at Beginner, denser ones at
//    Master). Promotion/recovery works exactly like Word/Number Flash.
//
// 2. Within-session compositional stage (Fix: "Challenge 1-5 single
//    symbols, 6-10 two symbols, 11-15 three symbols, 16-20 mixed") — a
//    fixed 4-stage arc every session walks through, independent of the
//    player's tier. Composing a 3-symbol group isn't a vocabulary/mastery
//    fact that should carry over between sessions the way word length or
//    digit length does; it's a warm-up structure within THIS session.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type SymbolFlashDifficultyProfile = {
  tier: DifficultyTier
  flashDurationMs: SpeedMs
  itemsPerSession: number
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const SYMBOL_FLASH_DIFFICULTY_PROFILES: Record<DifficultyTier, SymbolFlashDifficultyProfile> = {
  beginner: { tier: 'beginner', flashDurationMs: 500, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     flashDurationMs: 400, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  medium:   { tier: 'medium',   flashDurationMs: 300, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  advanced: { tier: 'advanced', flashDurationMs: 250, itemsPerSession: 20, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  expert:   { tier: 'expert',   flashDurationMs: 150, itemsPerSession: 20, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    flashDurationMs: 100, itemsPerSession: 20, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  master:   { tier: 'master',   flashDurationMs: 50,  itemsPerSession: 20, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', flashDurationMs: 300, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getSymbolFlashProfile(tier: DifficultyTier): SymbolFlashDifficultyProfile {
  return SYMBOL_FLASH_DIFFICULTY_PROFILES[tier]
}

// ── 5-level display naming (between-session tier) ──────────────────────────

export type SymbolFlashUiLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master'

const TIER_TO_UI_LEVEL: Record<DifficultyTier, SymbolFlashUiLevel> = {
  beginner: 'Beginner',
  easy: 'Beginner',
  medium: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
  elite: 'Expert',
  master: 'Master',
  adaptive: 'Intermediate',
}

export function symbolFlashUiLevel(tier: DifficultyTier): SymbolFlashUiLevel {
  return TIER_TO_UI_LEVEL[tier]
}

const UI_LEVEL_PACE_DESCRIPTOR: Record<SymbolFlashUiLevel, string> = {
  Beginner: 'Comfortable',
  Intermediate: 'Noticeably faster',
  Advanced: 'Requires concentration',
  Expert: 'Very fast',
  Master: 'Extremely fast',
}

export function symbolFlashPaceDescriptor(tier: DifficultyTier): string {
  return UI_LEVEL_PACE_DESCRIPTOR[symbolFlashUiLevel(tier)]
}

// ── 4-stage within-session compositional ramp ───────────────────────────────

export type SymbolGroupSize = 1 | 2 | 3 | 'mixed'

// Index 0-3, matching buildRampedSession's levelIndex for a levelCount: 4
// ramp — Challenge 1-5 / 6-10 / 11-15 / 16-20 for a 20-item mission.
export const SYMBOL_GROUP_STAGES: readonly SymbolGroupSize[] = [1, 2, 3, 'mixed']

const STAGE_LABELS: Record<string, string> = {
  '1': 'Single Symbol',
  '2': 'Two Symbols',
  '3': 'Three Symbols',
  mixed: 'Mixed Group',
}

export function symbolGroupStageLabel(groupSize: SymbolGroupSize): string {
  return STAGE_LABELS[String(groupSize)] ?? 'Single Symbol'
}
