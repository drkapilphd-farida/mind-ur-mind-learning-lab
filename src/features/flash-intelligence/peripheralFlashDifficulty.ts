// Peripheral Flash™ Difficulty — Visual Span Training, not a recognition
// game. The progression is built around FIVE distinct visual span
// mechanics (not just "more items, less time" like every other Flash
// mission): a single target, a horizontal pair, a vertical pair, a triple
// span, and finally an adaptive mastery stage that randomizes everything
// at once, including which kind of content appears (word / number /
// symbol). This is what makes the mission structurally different from
// Word/Number/Symbol/Mixed Flash, not just re-skinned.
//
// The 8 shared DifficultyTier values are unchanged (part of the Mission
// System / Adaptive Difficulty Engine — untouched here), but Peripheral
// Flash maps them onto its own 5-level mechanic, same as every other
// mission gives its own meaning to the same 8 tier names.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type PeripheralPosition =
  | 'left' | 'right' | 'top' | 'bottom'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const HORIZONTAL_PAIR: readonly PeripheralPosition[] = ['left', 'right']
const VERTICAL_PAIR: readonly PeripheralPosition[] = ['top', 'bottom']
const ALL_POSITIONS: readonly PeripheralPosition[] = [
  'left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right',
]

// Stimulus count: 1-3, or 'adaptive' at Level 5 — each item independently
// (seeded) picks its own count from 1-3, so the span demanded is
// genuinely unpredictable session to session, not just "always 3."
export type PeripheralStimulusCount = 1 | 2 | 3 | 'adaptive'

// The five visual span mechanics, in order. A tier maps to exactly one.
export type PeripheralTrainingLevel = 1 | 2 | 3 | 4 | 5

export type PeripheralFlashDifficultyProfile = {
  tier: DifficultyTier
  trainingLevel: PeripheralTrainingLevel
  stimulusCount: PeripheralStimulusCount
  distancePercent: number   // how far from the fixation point, as % of the display box's half-width
  // Level 5 only: per-item random jitter applied on top of distancePercent
  // (±this many percentage points), so "random distances" is real, not
  // just a fixed number restated. Zero for every other level.
  distanceJitterPercent: number
  flashDurationMs: SpeedMs
  positions: readonly PeripheralPosition[]
  // Level 5 only: each stimulus independently draws from word, number, or
  // symbol content instead of words only.
  mixedContentTypes: boolean
  itemsPerSession: number
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const PERIPHERAL_FLASH_DIFFICULTY_PROFILES: Record<DifficultyTier, PeripheralFlashDifficultyProfile> = {
  // Level 1 — Single Target: one word, left or right of the fixation point.
  beginner: { tier: 'beginner', trainingLevel: 1, stimulusCount: 1, distancePercent: 22, distanceJitterPercent: 0, flashDurationMs: 500, positions: HORIZONTAL_PAIR, mixedContentTypes: false, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     trainingLevel: 1, stimulusCount: 1, distancePercent: 26, distanceJitterPercent: 0, flashDurationMs: 400, positions: HORIZONTAL_PAIR, mixedContentTypes: false, itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  // Level 2 — Horizontal Pair: two simultaneous words, always left + right.
  medium:   { tier: 'medium',   trainingLevel: 2, stimulusCount: 2, distancePercent: 30, distanceJitterPercent: 0, flashDurationMs: 300, positions: HORIZONTAL_PAIR, mixedContentTypes: false, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  // Level 3 — Vertical Pair: two simultaneous words, always top + bottom —
  // a genuinely different axis of perception than Level 2, not a repeat.
  advanced: { tier: 'advanced', trainingLevel: 3, stimulusCount: 2, distancePercent: 34, distanceJitterPercent: 0, flashDurationMs: 250, positions: VERTICAL_PAIR, mixedContentTypes: false, itemsPerSession: 20, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  // Level 4 — Triple Span: three simultaneous words across the full ring
  // of 8 positions (never literally at center — the fixation point is
  // reserved, so the learner never has a reason to look away from it).
  expert:   { tier: 'expert',   trainingLevel: 4, stimulusCount: 3, distancePercent: 38, distanceJitterPercent: 0, flashDurationMs: 150, positions: ALL_POSITIONS, mixedContentTypes: false, itemsPerSession: 20, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    trainingLevel: 4, stimulusCount: 3, distancePercent: 40, distanceJitterPercent: 0, flashDurationMs: 100, positions: ALL_POSITIONS, mixedContentTypes: false, itemsPerSession: 20, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  // Level 5 — Adaptive Mastery: random position count (1-3), random
  // positions, random per-item distance, and mixed content kinds
  // (words / numbers / symbols) — nothing about a Level 5 item is fixed
  // except that it demands full peripheral awareness.
  master:   { tier: 'master',   trainingLevel: 5, stimulusCount: 'adaptive', distancePercent: 38, distanceJitterPercent: 6, flashDurationMs: 50, positions: ALL_POSITIONS, mixedContentTypes: true, itemsPerSession: 20, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', trainingLevel: 5, stimulusCount: 'adaptive', distancePercent: 34, distanceJitterPercent: 6, flashDurationMs: 200, positions: ALL_POSITIONS, mixedContentTypes: true, itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getPeripheralFlashProfile(tier: DifficultyTier): PeripheralFlashDifficultyProfile {
  return PERIPHERAL_FLASH_DIFFICULTY_PROFILES[tier]
}

// ── 5-level display naming ──────────────────────────────────────────────

export type PeripheralFlashUiLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master'

const TIER_TO_UI_LEVEL: Record<DifficultyTier, PeripheralFlashUiLevel> = {
  beginner: 'Beginner',
  easy: 'Beginner',
  medium: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
  elite: 'Expert',
  master: 'Master',
  adaptive: 'Intermediate',
}

export function peripheralFlashUiLevel(tier: DifficultyTier): PeripheralFlashUiLevel {
  return TIER_TO_UI_LEVEL[tier]
}

const UI_LEVEL_PACE_DESCRIPTOR: Record<PeripheralFlashUiLevel, string> = {
  Beginner: 'Comfortable',
  Intermediate: 'Noticeably faster',
  Advanced: 'Requires concentration',
  Expert: 'Very fast',
  Master: 'Extremely fast',
}

export function peripheralFlashPaceDescriptor(tier: DifficultyTier): string {
  return UI_LEVEL_PACE_DESCRIPTOR[peripheralFlashUiLevel(tier)]
}

// ── Training-level naming — the mechanic itself, distinct from pace ──────
// Shown in Mission Progress as "Level 3 · Vertical Span" so the learner
// always knows which of the five distinct mechanics they're training,
// not just how fast it is.

export const PERIPHERAL_LEVEL_NAME: Record<PeripheralTrainingLevel, string> = {
  1: 'Single Target',
  2: 'Horizontal Span',
  3: 'Vertical Span',
  4: 'Triple Span',
  5: 'Adaptive Mastery',
}

export const PERIPHERAL_LEVEL_DESCRIPTION: Record<PeripheralTrainingLevel, string> = {
  1: 'One target, left or right of your fixation point.',
  2: 'Two targets at once — left and right, simultaneously.',
  3: 'Two targets at once — above and below, simultaneously.',
  4: 'Three targets at once, spread around your fixation point.',
  5: 'Fully adaptive — random positions, distances, and content.',
}

export function peripheralFlashTrainingLevel(tier: DifficultyTier): PeripheralTrainingLevel {
  return PERIPHERAL_FLASH_DIFFICULTY_PROFILES[tier].trainingLevel
}

// Premium, mechanic-specific question wording — replaces generic quiz
// phrasing ("What did you see?") with language specific to what this
// level actually demands, per the mission's own examples.
const LEVEL_QUESTION_PROMPT: Record<PeripheralTrainingLevel, string> = {
  1: 'Which visual target appeared?',
  2: 'Which pair appeared?',
  3: 'Which pair appeared?',
  4: 'Which visual targets did you recognize?',
  5: 'Which visual pattern appeared?',
}

export function peripheralFlashQuestionPrompt(tier: DifficultyTier): string {
  return LEVEL_QUESTION_PROMPT[peripheralFlashTrainingLevel(tier)]
}
