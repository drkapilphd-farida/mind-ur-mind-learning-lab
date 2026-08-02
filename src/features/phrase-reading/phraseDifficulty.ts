// Phrase Reading™ Difficulty — Mission 2 of the Reading Intelligence Pack™.
// Mirrors Progressive Chunk Reading™'s (PCR) locked Level System pattern
// (mastery-gated levels, decoupled from the shared 8-tier DifficultyTier
// ladder within a session) but is NOT imported from PCR — PCR is a locked
// module, and every mission in this pack is an independently self-contained
// feature folder (PCR itself never imports from Chunk/Phrase Reading's
// engines either, only their datasets). Redefining this small, generic
// shape here keeps a future edit to one locked mission from ever silently
// breaking another.
//
// Per-level pass requirements reuse PCR's exact pass-percentage curve
// (50% → 75% → 80% → 80% → 83%) for a consistent mastery bar across the
// whole Reading Intelligence Pack. Round sizes are scaled down from PCR's
// 20-then-10 rhythm to 8-then-4 so one level totals ~20-24 phrases and
// takes about 3 minutes, matching the Mission Objectives brief.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type PhraseReadingLevel = 1 | 2 | 3 | 4 | 5

export type PhraseReadingProfile = {
  tier: DifficultyTier
  level: PhraseReadingLevel
  // Reading pace, milliseconds per word — reuses PCR's exact tier ladder so
  // the whole Reading Intelligence Pack feels consistently paced.
  msPerWord: SpeedMs
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const PHRASE_READING_PROFILES: Record<DifficultyTier, PhraseReadingProfile> = {
  beginner: { tier: 'beginner', level: 1, msPerWord: 400, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     level: 2, msPerWord: 300, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  medium:   { tier: 'medium',   level: 3, msPerWord: 250, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  advanced: { tier: 'advanced', level: 4, msPerWord: 200, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  expert:   { tier: 'expert',   level: 4, msPerWord: 150, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    level: 5, msPerWord: 120, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  master:   { tier: 'master',   level: 5, msPerWord: 100, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', level: 5, msPerWord: 150, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getPhraseReadingProfile(tier: DifficultyTier): PhraseReadingProfile {
  return PHRASE_READING_PROFILES[tier]
}

// Canonical tier for each level — used once a session drives its OWN
// in-session level progression via Continue/Try Again (level, not tier, is
// the progression currency within a session; the learner's persisted
// DifficultyTier only decides which level a fresh session STARTS at).
export const PHRASE_READING_LEVEL_DEFAULT_TIER: Record<PhraseReadingLevel, DifficultyTier> = {
  1: 'beginner',
  2: 'easy',
  3: 'medium',
  4: 'advanced',
  5: 'elite',
}

export function phraseReadingLevel(tier: DifficultyTier): PhraseReadingLevel {
  return PHRASE_READING_PROFILES[tier].level
}

// ── Level pass requirements ──────────────────────────────────────────────
export type PhraseReadingLevelRequirement = {
  challengesRequired: number // = number of rounds this level attempt has (1 Brain Challenge per round)
  passCount: number
}

export const PHRASE_READING_LEVEL_REQUIREMENTS: Record<PhraseReadingLevel, PhraseReadingLevelRequirement> = {
  1: { challengesRequired: 4, passCount: 2 },
  2: { challengesRequired: 4, passCount: 3 },
  3: { challengesRequired: 5, passCount: 4 },
  4: { challengesRequired: 5, passCount: 4 },
  5: { challengesRequired: 6, passCount: 5 },
}

export function getPhraseReadingLevelRequirement(level: PhraseReadingLevel): PhraseReadingLevelRequirement {
  return PHRASE_READING_LEVEL_REQUIREMENTS[level]
}

// Level 5 ("Advanced Phrase Reading") pass bar — percentage-based, like
// Sentence Reading's own `computeSentenceLevelPassed`, since this level
// reuses that engine's 2-questions-per-item round shape (4 total
// questions/attempt: 2 phrases × 2 questions each) rather than Levels
// 1-4's integer-ratio scheme. Kept as a small, separate, parallel constant
// rather than folded into PHRASE_READING_LEVEL_REQUIREMENTS above, so that
// record's existing Level 5 entry — and every test asserting it — stays
// untouched; it simply goes unused once the component routes Level 5
// through this constant instead.
//
// 88% continues Phrase Reading's own rising pass-bar curve as the
// mission's capstone (50 → 75 → 80 → 80 → 88), rather than inheriting
// either of Sentence Reading's own bars verbatim: not its Level 1 bar
// (60%, calibrated for the easiest tier of a different mission — using it
// here would be a jarring drop in rigor for what should feel like the
// hardest level), and not its own Level 5 bar (90%, calibrated for full
// 18-24 word sentences, stricter than this level's 6-8 word phrase
// content needs to be).
export const PHRASE_READING_ADVANCED_LEVEL_REQUIREMENT = {
  itemsPerAttempt: 2,       // 2 advanced phrases per Level 5 attempt
  questionsPerAttempt: 4,   // 2 Brain Challenges per phrase
  requiredPercent: 88,
} as const

export function phraseReadingPassPercent(level: PhraseReadingLevel): number {
  const req = PHRASE_READING_LEVEL_REQUIREMENTS[level]
  return Math.round((req.passCount / req.challengesRequired) * 100)
}

// Phrases shown per round: the first round of a level attempt is a longer,
// 8-phrase initial exposure; every round after that is a shorter 4-phrase
// reinforcement round. Scaled down from PCR's 20-then-10 chunk rhythm so a
// full level totals ~20-24 phrases (~3 minutes), not ~50-70.
export function phraseReadingPhrasesForRound(roundIndexInLevel: number): number {
  return roundIndexInLevel === 0 ? 8 : 4
}

// Total phrases across a full level attempt (all rounds) — feeds the
// Mission Objectives idle screen's "Mission: N Phrases" line.
export function phraseReadingTotalPhrasesForLevel(level: PhraseReadingLevel): number {
  const { challengesRequired } = PHRASE_READING_LEVEL_REQUIREMENTS[level]
  let total = 0
  for (let round = 0; round < challengesRequired; round++) total += phraseReadingPhrasesForRound(round)
  return total
}

export const PHRASE_READING_LEVEL_NAME: Record<PhraseReadingLevel, string> = {
  1: 'Simple Actions',
  2: 'Learning Phrases',
  3: 'Meaning-Rich',
  4: 'Extended Phrases',
  5: 'Advanced Phrase Reading',
}

export const PHRASE_READING_LEVEL_DESCRIPTION: Record<PhraseReadingLevel, string> = {
  1: 'Short action phrases — the foundation of instant meaning recognition.',
  2: 'Learning-focused phrases — recognising complete ideas, not just words.',
  3: 'Meaning-rich phrases — precise recognition among near-identical wording.',
  4: 'Extended phrase fragments — longer wording, still never a full sentence.',
  5: 'Advanced Phrase Reading — 6-8 word phrases with richer, cross-pool challenges.',
}

// Compact "Phrase Length" readout for the Mission Objectives idle screen —
// distinct from PHRASE_READING_LEVEL_DESCRIPTION, which is a full sentence.
export const PHRASE_READING_LENGTH_LABEL: Record<PhraseReadingLevel, string> = {
  1: '2 Words',
  2: '3 Words',
  3: '4 Words',
  4: '5 Words',
  5: '6-8 Words',
}

// Typography evolves with level exactly like PCR — same shared FitText
// roles, zero new CSS.
export const PHRASE_READING_TYPOGRAPHY_ROLE: Record<PhraseReadingLevel, 'reading-1' | 'reading-2' | 'reading-3' | 'reading-4' | 'reading-5'> = {
  1: 'reading-1',
  2: 'reading-2',
  3: 'reading-3',
  4: 'reading-4',
  5: 'reading-5',
}

