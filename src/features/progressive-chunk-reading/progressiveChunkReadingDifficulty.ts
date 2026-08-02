// Progressive Chunk Reading™ Difficulty — maps the mission's 5 levels onto
// the shared 8-tier DifficultyTier ladder, exactly the way every other
// mission gives its own meaning to the same 8 tier names (Peripheral
// Flash's 5 visual-span mechanics is the closest precedent). No new tier
// system, no new promotion/recovery math — this file only supplies the
// per-tier parameters those shared engines already consume.
//
// Word count is drawn from the REAL, already-curated datasets rather than
// invented per-level: Levels 1-3 reuse chunkDataset.ts's existing
// beginner=2/easy=3/medium=4-word tiers unchanged. Level 4 ("Natural
// Reading") reuses Phrase Reading's complete-sentence dataset directly
// (contentType 'reading-phrase') rather than authoring a third, redundant
// "natural phrase" pool. Level 5 ("Adaptive Mastery") draws from BOTH
// pools, alternating per block.

import type { DifficultyTier, SpeedMs, ContentType } from '@/types/exercise-engine'
import { pickItems } from '@/lib/exercise-engine/randomizationEngine'

export type ProgressiveChunkReadingLevel = 1 | 2 | 3 | 4 | 5

export type ProgressiveChunkReadingProfile = {
  tier: DifficultyTier
  level: ProgressiveChunkReadingLevel
  // Which curated pool(s) this tier draws from. Two entries only at Level
  // 5 — each level-5 attempt picks one (seeded), since a tier now only
  // ever gets visited once per level attempt (see
  // progressiveChunkReadingEngine.ts / the Experience component's
  // per-round, mastery-gated generation).
  contentTypes: readonly ContentType[]
  // Reading pace, expressed as SpeedMs but meaning "milliseconds per word"
  // here rather than "milliseconds per flash" — the same adaptive speed
  // machinery (computeNextSpeed / computeSpeedRecommendation) already used
  // by every other mission ratchets this up or down after each session
  // exactly as it does theirs; only what the number means has shifted from
  // "how briefly does the stimulus flash" to "how fast does reading move."
  msPerWord: SpeedMs
  // Still used by the shared between-session promotion/recovery engine
  // (computePromotion/computeRecovery, unchanged) — a separate concept
  // from the within-level pass requirements below, which gate advancing
  // levels WITHIN one session, not what tier next session starts at.
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const PROGRESSIVE_CHUNK_READING_PROFILES: Record<DifficultyTier, ProgressiveChunkReadingProfile> = {
  beginner: { tier: 'beginner', level: 1, contentTypes: ['chunk'], msPerWord: 400, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     level: 2, contentTypes: ['chunk'], msPerWord: 300, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  medium:   { tier: 'medium',   level: 3, contentTypes: ['chunk'], msPerWord: 250, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  advanced: { tier: 'advanced', level: 4, contentTypes: ['reading-phrase'], msPerWord: 200, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  expert:   { tier: 'expert',   level: 4, contentTypes: ['reading-phrase'], msPerWord: 150, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    level: 5, contentTypes: ['chunk', 'reading-phrase'], msPerWord: 120, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  master:   { tier: 'master',   level: 5, contentTypes: ['chunk', 'reading-phrase'], msPerWord: 100, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', level: 5, contentTypes: ['chunk', 'reading-phrase'], msPerWord: 150, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getProgressiveChunkReadingProfile(tier: DifficultyTier): ProgressiveChunkReadingProfile {
  return PROGRESSIVE_CHUNK_READING_PROFILES[tier]
}

// Canonical tier for each level, used once a session starts driving its
// OWN in-session level progression (Continue / Try Again) — level, not
// tier, is the progression currency within a session now (a learner
// passes or retries a LEVEL, never lands mid-level on a specific one of
// its underlying tiers). The learner's real persisted DifficultyTier
// still decides which level a session STARTS at
// (progressiveChunkReadingLevel(tier)) — this mapping only supplies
// content parameters (msPerWord, contentTypes) for levels reached
// in-session via Continue/Try Again, where only the level number is
// tracked, not a specific sub-tier.
export const PROGRESSIVE_CHUNK_READING_LEVEL_DEFAULT_TIER: Record<ProgressiveChunkReadingLevel, DifficultyTier> = {
  1: 'beginner',
  2: 'easy',
  3: 'medium',
  4: 'advanced',
  5: 'elite',
}

// ── Level pass requirements — "increase mastery gradually" ────────────────
// Each level is a fixed number of Brain Challenges (one per reading
// round); a level is passed only once at least `passCount` of them are
// answered correctly. The bar itself rises with level (50% → 75% → 80% →
// 80% → 83%), not just the content difficulty.
export type ProgressiveChunkReadingLevelRequirement = {
  challengesRequired: number
  passCount: number
}

export const PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS: Record<ProgressiveChunkReadingLevel, ProgressiveChunkReadingLevelRequirement> = {
  1: { challengesRequired: 4, passCount: 2 },
  2: { challengesRequired: 4, passCount: 3 },
  3: { challengesRequired: 5, passCount: 4 },
  4: { challengesRequired: 5, passCount: 4 },
  5: { challengesRequired: 6, passCount: 5 },
}

export function getProgressiveChunkReadingLevelRequirement(level: ProgressiveChunkReadingLevel): ProgressiveChunkReadingLevelRequirement {
  return PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS[level]
}

// The required percentage, for the Pass/Fail screens' "Need 80%" line.
export function progressiveChunkReadingPassPercent(level: ProgressiveChunkReadingLevel): number {
  const req = PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS[level]
  return Math.round((req.passCount / req.challengesRequired) * 100)
}

// Chunks shown per reading round: the first round of a level attempt is
// a longer, 20-chunk initial exposure; every round after that (within the
// same attempt) is a shorter 10-chunk reinforcement round. Independent of
// level — every level follows the same rhythm, just for a different
// number of rounds (challengesRequired above).
export function progressiveChunkReadingChunksForRound(roundIndexInLevel: number): number {
  return roundIndexInLevel === 0 ? 20 : 10
}

export const PROGRESSIVE_CHUNK_READING_LEVEL_NAME: Record<ProgressiveChunkReadingLevel, string> = {
  1: 'Foundation',
  2: 'Building Rhythm',
  3: 'Expanding Span',
  4: 'Natural Reading',
  5: 'Adaptive Mastery',
}

export const PROGRESSIVE_CHUNK_READING_LEVEL_DESCRIPTION: Record<ProgressiveChunkReadingLevel, string> = {
  1: 'Two-word chunks — the foundation of reading rhythm.',
  2: 'Three-word chunks — a wider unit per fixation.',
  3: 'Four-word chunks — reading in larger visual groups.',
  4: 'Complete, natural phrases — reading the way real sentences read.',
  5: 'Adaptive mastery — word groups and phrases, mixed and unpredictable.',
}

// Short label for the persistent Level HUD's "Chunk Size" field — distinct
// from PROGRESSIVE_CHUNK_READING_LEVEL_DESCRIPTION, which is a full
// sentence meant for the idle/goal screen, not a compact status readout.
export const PROGRESSIVE_CHUNK_READING_CHUNK_SIZE_LABEL: Record<ProgressiveChunkReadingLevel, string> = {
  1: '2 Words',
  2: '3 Words',
  3: '4 Words',
  4: 'Natural Phrase',
  5: 'Adaptive',
}

// Difficulty stars for the Level HUD — a direct, familiar visual encoding
// of level 1-5, nothing more.
export const PROGRESSIVE_CHUNK_READING_DIFFICULTY_STARS: Record<ProgressiveChunkReadingLevel, string> = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  5: '⭐⭐⭐⭐⭐',
}

// Typography evolves with level (Fix 5 of the polish brief) — a distinct
// FitText role per level, each its own small, additive CSS rule (see
// globals.css's .fit-text-reading-N rules and FitText.tsx's FitTextRole
// union). Every role stays within the same comfortable, premium size
// range as the original 'reading' role; only the exact size/line-height
// balance shifts — large and generous at Level 1, calmer and more
// book-like by Level 5. Never smaller or harder to read than Level 5's
// floor.
export const PROGRESSIVE_CHUNK_READING_TYPOGRAPHY_ROLE: Record<ProgressiveChunkReadingLevel, 'reading-1' | 'reading-2' | 'reading-3' | 'reading-4' | 'reading-5'> = {
  1: 'reading-1',
  2: 'reading-2',
  3: 'reading-3',
  4: 'reading-4',
  5: 'reading-5',
}

export function progressiveChunkReadingLevel(tier: DifficultyTier): ProgressiveChunkReadingLevel {
  return PROGRESSIVE_CHUNK_READING_PROFILES[tier].level
}

// Real, calculated words-per-minute this tier's pacing represents — not a
// reaction-time proxy. 60000 / msPerWord = words read per minute at this
// tier's system-controlled pace.
export function progressiveChunkReadingTargetWpm(msPerWord: SpeedMs): number {
  return Math.round(60000 / msPerWord)
}

// Comprehension-flavored "Brain Challenge" question wording (never "What
// did you see?" — that's the Flash Pack's register), randomized per
// question so the recognition moment doesn't feel like the same rote
// prompt every time. Levels 1-3 ask about a word group; Level 4-5 ask
// about a phrase, since their content is grammatically whole sentences
// rather than short groups.
const LEVEL_QUESTION_PROMPTS: Record<ProgressiveChunkReadingLevel, readonly string[]> = {
  1: ['Which word group appeared in this block?', 'Which chunk appeared exactly?', 'Select the exact chunk.'],
  2: ['Which word group appeared in this block?', 'Which chunk appeared exactly?', 'Select the exact chunk.'],
  3: ['Which word group appeared in this block?', 'Which chunk appeared exactly?', 'Select the exact chunk.'],
  4: ['Which phrase appeared in this block?', 'Which phrase was flashed?', 'Select the exact phrase.'],
  5: ['Which phrase appeared in this block?', 'Which phrase was flashed?', 'Select the exact phrase.'],
}

export function progressiveChunkReadingQuestionPrompt(tier: DifficultyTier, seed: number): string {
  const prompts = LEVEL_QUESTION_PROMPTS[progressiveChunkReadingLevel(tier)]
  return pickItems([...prompts], 1, seed)[0] ?? prompts[0]!
}
