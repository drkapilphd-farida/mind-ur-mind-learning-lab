// Paragraph Reading™ Difficulty — Mission 5 of the Reading Intelligence
// Pack™. Independently self-contained (not imported from sentenceDifficulty
// or any sibling mission), same precedent as every other file in this pack.
//
// Progression model: the brief's Mission Home example says "Mission 1 of
// 20"; its Level Design section gives exactly 5 word-count tiers
// (120/150/180/220/260). These reconcile at 5 levels × 4 missions/level =
// 20 missions. `mission` (1-20) is the real gating unit — passing Mission N
// unlocks Mission N+1, mirroring how `SentenceReadingLevel` gates Sentence
// Reading. `level` (1-5) is purely a DERIVED, presentational value
// (`Math.ceil(mission / 4)`) used for the word-count/difficulty-star
// display — never a separate gate. The pass bar (60/70/75/80/85%) is held
// constant across the 4 missions inside a level, the same bar shape
// Sentence Reading already validated.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type ParagraphReadingLevel = 1 | 2 | 3 | 4 | 5
export type ParagraphReadingMission = number // 1-20

export function paragraphLevelForMission(mission: ParagraphReadingMission): ParagraphReadingLevel {
  return Math.min(5, Math.max(1, Math.ceil(mission / 4))) as ParagraphReadingLevel
}

export type ParagraphLevelRequirement = {
  targetWords: number
  requiredPercent: number
}

export const PARAGRAPH_LEVEL_REQUIREMENTS: Record<ParagraphReadingLevel, ParagraphLevelRequirement> = {
  1: { targetWords: 120, requiredPercent: 60 },
  2: { targetWords: 150, requiredPercent: 70 },
  3: { targetWords: 180, requiredPercent: 75 },
  4: { targetWords: 220, requiredPercent: 80 },
  5: { targetWords: 260, requiredPercent: 85 },
}

export type ParagraphMissionRequirement = ParagraphLevelRequirement & {
  level: ParagraphReadingLevel
}

// 20-entry lookup so Mission→Mission gating is direct data, not re-derived
// from `level` on every read.
export const PARAGRAPH_MISSION_REQUIREMENTS: Record<ParagraphReadingMission, ParagraphMissionRequirement> = Object.fromEntries(
  Array.from({ length: 20 }, (_, i) => {
    const mission = i + 1
    const level = paragraphLevelForMission(mission)
    return [mission, { ...PARAGRAPH_LEVEL_REQUIREMENTS[level], level }]
  }),
) as Record<ParagraphReadingMission, ParagraphMissionRequirement>

export function getParagraphMissionRequirement(mission: ParagraphReadingMission): ParagraphMissionRequirement {
  return PARAGRAPH_MISSION_REQUIREMENTS[mission] ?? PARAGRAPH_MISSION_REQUIREMENTS[20]!
}

// Pass/fail compares the REAL computed percentage against the bar directly
// — same as every mission in this pack.
export function computeParagraphMissionPassed(accuracyPercent: number, requiredPercent: number): boolean {
  return accuracyPercent >= requiredPercent
}

// Reading pace, milliseconds per word — reuses the pack's exact tier
// ladder for consistent pacing across every Reading Intelligence Pack
// mission (same values Sentence Reading's SENTENCE_READING_PROFILES uses).
export const PARAGRAPH_READING_MS_PER_WORD: Record<DifficultyTier, SpeedMs> = {
  beginner: 400,
  easy: 300,
  medium: 250,
  advanced: 200,
  expert: 150,
  elite: 120,
  master: 100,
  adaptive: 150,
}

// Tier→starting-mission mapping — the one genuinely new mapping this
// mission needs (Sentence Reading only maps 8 tiers → 5 levels; this maps
// 8 tiers → 20 missions). Monotonic; used only to pick a FRESH session's
// starting mission from the learner's persisted tier — all further
// progression is the session's own mission-by-mission increment.
export const PARAGRAPH_READING_TIER_STARTING_MISSION: Record<DifficultyTier, ParagraphReadingMission> = {
  beginner: 1,
  easy: 3,
  medium: 6,
  advanced: 9,
  expert: 12,
  elite: 15,
  master: 18,
  adaptive: 20,
}

export function paragraphReadingStartingMission(tier: DifficultyTier): ParagraphReadingMission {
  return PARAGRAPH_READING_TIER_STARTING_MISSION[tier]
}

// Canonical tier for each LEVEL (not mission) — used once a session drives
// its own in-session mission progression, so reading pace still speeds up
// as the level rises within a session (same mechanism Sentence Reading's
// SENTENCE_READING_LEVEL_DEFAULT_TIER provides).
export const PARAGRAPH_READING_LEVEL_DEFAULT_TIER: Record<ParagraphReadingLevel, DifficultyTier> = {
  1: 'beginner',
  2: 'easy',
  3: 'medium',
  4: 'advanced',
  5: 'elite',
}

export const PARAGRAPH_READING_LEVEL_NAME: Record<ParagraphReadingLevel, string> = {
  1: 'First Meaning Blocks',
  2: 'Building Context',
  3: 'Connected Reasoning',
  4: 'Layered Understanding',
  5: 'Full Meaning Mastery',
}

// Compact "Paragraph Length" readout for the Mission Home / HUD.
export const PARAGRAPH_READING_LENGTH_LABEL: Record<ParagraphReadingLevel, string> = {
  1: '~120 Words',
  2: '~150 Words',
  3: '~180 Words',
  4: '~220 Words',
  5: '~260 Words',
}

// Difficulty stars — a purely presentational transform of `level`, matching
// the brief's own "★★☆☆☆" example (e.g. Level 2 → ★★☆☆☆).
export function paragraphDifficultyStars(level: ParagraphReadingLevel): string {
  return '★'.repeat(level) + '☆'.repeat(5 - level)
}
