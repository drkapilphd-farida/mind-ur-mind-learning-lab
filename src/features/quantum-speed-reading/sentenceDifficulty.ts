// Sentence Reading™ Difficulty — Mission 4 of the Reading Intelligence
// Pack™. Mirrors Multi-Line Reading's Level System pattern (mastery-gated
// levels, decoupled from the shared 8-tier DifficultyTier ladder within a
// session) but is NOT imported from it, or from PCR/Phrase Reading —
// every mission in this pack is an independently self-contained feature
// folder. Redefining this small, generic shape here keeps a future edit
// to one locked mission from ever silently breaking another.
//
// Difficulty increases only by sentence length and idea complexity, per
// the locked spec — never by question complexity. The pass bar rises
// (60% → 70% → 75% → 80% → 85%) while every level attempt is always
// exactly one 5-sentence "Mini Learning Chapter" + 4 whole-chapter
// questions; since these percentages don't divide evenly into quarters,
// pass/fail compares the REAL computed percentage against the bar
// directly, same as Multi-Line Reading.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type SentenceReadingLevel = 1 | 2 | 3 | 4 | 5

export type SentenceReadingProfile = {
  tier: DifficultyTier
  level: SentenceReadingLevel
  // Reading pace, milliseconds per word — reuses the pack's exact tier
  // ladder for consistent pacing across every Reading Intelligence Pack
  // mission.
  msPerWord: SpeedMs
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const SENTENCE_READING_PROFILES: Record<DifficultyTier, SentenceReadingProfile> = {
  beginner: { tier: 'beginner', level: 1, msPerWord: 400, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     level: 2, msPerWord: 300, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  medium:   { tier: 'medium',   level: 3, msPerWord: 250, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  advanced: { tier: 'advanced', level: 4, msPerWord: 200, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  expert:   { tier: 'expert',   level: 4, msPerWord: 150, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    level: 5, msPerWord: 120, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  master:   { tier: 'master',   level: 5, msPerWord: 100, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', level: 5, msPerWord: 150, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getSentenceReadingProfile(tier: DifficultyTier): SentenceReadingProfile {
  return SENTENCE_READING_PROFILES[tier]
}

// Canonical tier for each level — used once a session drives its OWN
// in-session level progression via Continue/Try Again.
export const SENTENCE_READING_LEVEL_DEFAULT_TIER: Record<SentenceReadingLevel, DifficultyTier> = {
  1: 'beginner',
  2: 'easy',
  3: 'medium',
  4: 'advanced',
  5: 'elite',
}

export function sentenceReadingLevel(tier: DifficultyTier): SentenceReadingLevel {
  return SENTENCE_READING_PROFILES[tier].level
}

// ── Level structure — locked spec ──────────────────────────────────────
export type SentenceLevelRequirement = {
  minWords: number
  maxWords: number
  requiredPercent: number       // pass bar: 60/70/75/80/85
  questionsPerAttempt: number   // always 4 — one whole-chapter Brain Challenge
}

export const SENTENCE_LEVEL_REQUIREMENTS: Record<SentenceReadingLevel, SentenceLevelRequirement> = {
  1: { minWords: 6, maxWords: 8, requiredPercent: 60, questionsPerAttempt: 4 },
  2: { minWords: 8, maxWords: 10, requiredPercent: 70, questionsPerAttempt: 4 },
  3: { minWords: 10, maxWords: 12, requiredPercent: 75, questionsPerAttempt: 4 },
  4: { minWords: 12, maxWords: 16, requiredPercent: 80, questionsPerAttempt: 4 },
  5: { minWords: 16, maxWords: 22, requiredPercent: 85, questionsPerAttempt: 4 },
}

export function getSentenceLevelRequirement(level: SentenceReadingLevel): SentenceLevelRequirement {
  return SENTENCE_LEVEL_REQUIREMENTS[level]
}

// Pass/fail compares the REAL computed percentage against the level's bar
// directly — 60/70/80/85/90% don't divide evenly into quarters, so there
// is no precomputed integer pass count.
export function computeSentenceLevelPassed(accuracyPercent: number, requiredPercent: number): boolean {
  return accuracyPercent >= requiredPercent
}

export const SENTENCE_READING_LEVEL_NAME: Record<SentenceReadingLevel, string> = {
  1: 'First Ideas',
  2: 'Building Comprehension',
  3: 'Fluent Recognition',
  4: 'Complex Ideas',
  5: 'Full Idea Mastery',
}

export const SENTENCE_READING_LEVEL_DESCRIPTION: Record<SentenceReadingLevel, string> = {
  1: 'Short, direct sentences — the foundation of instant idea recognition.',
  2: 'Slightly longer sentences — holding one complete thought in mind.',
  3: 'Fuller sentences — recognizing the idea without reading every word.',
  4: 'Complex sentences — multiple details, one central idea.',
  5: 'Full-length sentences — complete idea mastery in a single visual span.',
}

// Compact "Sentence Length" readout for the Mission Home / HUD.
export const SENTENCE_READING_LENGTH_LABEL: Record<SentenceReadingLevel, string> = {
  1: '6-8 Words',
  2: '8-10 Words',
  3: '10-12 Words',
  4: '12-16 Words',
  5: '16-22 Words',
}

// "Sentence Complexity" readout — a distinct, top-right visual indicator
// separate from the Level Map, using the brief's own exact per-level
// words. Not a synonym for SENTENCE_READING_LEVEL_NAME (a longer,
// narrative name) — this is the short, single-word complexity label shown
// beside the ●○○○○-style dots.
export const SENTENCE_COMPLEXITY_LABEL: Record<SentenceReadingLevel, string> = {
  1: 'Simple',
  2: 'Connected',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
}
