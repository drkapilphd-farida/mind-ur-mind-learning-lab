// Multi-Line Reading™ Difficulty — Mission 3 of the Reading Intelligence
// Pack™. Mirrors Progressive Chunk Reading's and Phrase Reading's Level
// System pattern (mastery-gated levels, decoupled from the shared 8-tier
// DifficultyTier ladder within a session) but is NOT imported from either
// — both are locked modules, and every mission in this pack is an
// independently self-contained feature folder. Redefining this small,
// generic shape here keeps a future edit to one locked mission from ever
// silently breaking another.
//
// Difficulty increases only by line count, text density, and pace — never
// by question complexity — per the locked spec. The pass bar itself rises
// (60% → 70% → 80% → 85% → 90%) while the round count stays flat at 2
// paragraphs / 4 questions per level attempt; since these percentages
// don't divide evenly into quarters, pass/fail compares the REAL computed
// percentage against the bar directly rather than a precomputed integer
// pass count (unlike PCR/Phrase Reading, where the chosen challenge counts
// were deliberately picked to divide evenly).

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type MultiLineReadingLevel = 1 | 2 | 3 | 4 | 5

export type MultiLineReadingProfile = {
  tier: DifficultyTier
  level: MultiLineReadingLevel
  // Reading pace, milliseconds per word — reuses PCR/Phrase Reading's
  // exact tier ladder for a consistent pace across the whole Reading
  // Intelligence Pack. "Faster display" at higher levels comes from this.
  msPerWord: SpeedMs
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const MULTI_LINE_READING_PROFILES: Record<DifficultyTier, MultiLineReadingProfile> = {
  beginner: { tier: 'beginner', level: 1, msPerWord: 400, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     level: 2, msPerWord: 300, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  medium:   { tier: 'medium',   level: 3, msPerWord: 250, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  advanced: { tier: 'advanced', level: 4, msPerWord: 200, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  expert:   { tier: 'expert',   level: 4, msPerWord: 150, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    level: 5, msPerWord: 120, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  master:   { tier: 'master',   level: 5, msPerWord: 100, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', level: 5, msPerWord: 150, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getMultiLineReadingProfile(tier: DifficultyTier): MultiLineReadingProfile {
  return MULTI_LINE_READING_PROFILES[tier]
}

// Canonical tier for each level — used once a session drives its OWN
// in-session level progression via Continue/Try Again (level, not tier, is
// the progression currency within a session; the learner's persisted
// DifficultyTier only decides which level a fresh session STARTS at).
export const MULTI_LINE_READING_LEVEL_DEFAULT_TIER: Record<MultiLineReadingLevel, DifficultyTier> = {
  1: 'beginner',
  2: 'easy',
  3: 'medium',
  4: 'advanced',
  5: 'elite',
}

export function multiLineReadingLevel(tier: DifficultyTier): MultiLineReadingLevel {
  return MULTI_LINE_READING_PROFILES[tier].level
}

// ── Level structure — locked spec ──────────────────────────────────────
export type MultiLineLevelRequirement = {
  lineCount: number         // paragraph length at this level (4-8 lines)
  requiredPercent: number   // pass bar: 60/70/80/85/90
  paragraphsPerAttempt: number // always 2 — 2 Brain Challenges per paragraph = 4 Questions/level
  questionsPerAttempt: number  // always 4
}

export const MULTI_LINE_LEVEL_REQUIREMENTS: Record<MultiLineReadingLevel, MultiLineLevelRequirement> = {
  1: { lineCount: 4, requiredPercent: 60, paragraphsPerAttempt: 2, questionsPerAttempt: 4 },
  2: { lineCount: 5, requiredPercent: 70, paragraphsPerAttempt: 2, questionsPerAttempt: 4 },
  3: { lineCount: 6, requiredPercent: 80, paragraphsPerAttempt: 2, questionsPerAttempt: 4 },
  4: { lineCount: 7, requiredPercent: 85, paragraphsPerAttempt: 2, questionsPerAttempt: 4 },
  5: { lineCount: 8, requiredPercent: 90, paragraphsPerAttempt: 2, questionsPerAttempt: 4 },
}

export function getMultiLineLevelRequirement(level: MultiLineReadingLevel): MultiLineLevelRequirement {
  return MULTI_LINE_LEVEL_REQUIREMENTS[level]
}

// Pass/fail compares the REAL computed percentage against the level's bar
// directly — 60/70/80/85/90% don't divide evenly into quarters, so there
// is no precomputed integer pass count to reuse the way PCR/Phrase
// Reading did.
export function computeMultiLineLevelPassed(accuracyPercent: number, requiredPercent: number): boolean {
  return accuracyPercent >= requiredPercent
}

export const MULTI_LINE_READING_LEVEL_NAME: Record<MultiLineReadingLevel, string> = {
  1: 'First Steps',
  2: 'Building Tracking',
  3: 'Steady Navigation',
  4: 'Extended Span',
  5: 'Full Page Control',
}

export const MULTI_LINE_READING_LEVEL_DESCRIPTION: Record<MultiLineReadingLevel, string> = {
  1: 'Four-line paragraphs — the foundation of tracking across lines.',
  2: 'Five-line paragraphs — a slightly longer block to navigate.',
  3: 'Six-line paragraphs — sustained line-to-line tracking.',
  4: 'Seven-line paragraphs — a fuller block, denser text.',
  5: 'Eight-line paragraphs — full spatial control across a real block.',
}

// Compact "Paragraph Size" readout for the Mission Home / HUD.
export const MULTI_LINE_READING_SIZE_LABEL: Record<MultiLineReadingLevel, string> = {
  1: '4 Lines',
  2: '5 Lines',
  3: '6 Lines',
  4: '7 Lines',
  5: '8 Lines',
}
