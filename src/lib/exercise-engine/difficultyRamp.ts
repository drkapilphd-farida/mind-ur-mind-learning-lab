// Difficulty Ramp Engine™ — the shared, mission-agnostic primitive behind
// "difficulty must automatically increase during the mission." Every
// existing exercise (Chunk/Phrase/Multi-Line Reading, RVI, Word Flash,
// Number Flash) already adapts BETWEEN sessions (promotion/recovery at
// session end); nothing previously ramped difficulty WITHIN one session.
// This module adds that capability once, here, so every future Flash
// mission (Symbol, Mixed, Rapid, Peripheral) gets it by plugging in a
// per-segment item builder — no mission re-implements the ramping logic
// itself.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'
import { SPEED_TIERS } from '@/types/exercise-engine'

// The 5 representative tiers behind the 5 named UI levels every Flash
// mission already uses (Beginner/Intermediate/Advanced/Expert/Master).
// Deliberately skips 'easy' and 'elite' — those exist in the underlying
// 8-tier DifficultyTier system for the BETWEEN-session adaptive engine,
// but for a within-session ramp they'd just repeat the same
// digit/word-length parameter as their neighbor, adding a step that
// wouldn't feel like progress.
export const RAMP_LEVEL_TIERS: readonly DifficultyTier[] = ['beginner', 'medium', 'advanced', 'expert', 'master']

export function levelIndexForTier(tier: DifficultyTier): number {
  if (tier === 'adaptive') return 1 // treat as Intermediate, matching the UI-level mapping every mission already uses
  if (tier === 'easy') return 0
  if (tier === 'elite') return 3
  const idx = RAMP_LEVEL_TIERS.indexOf(tier)
  return idx >= 0 ? idx : 0
}

// Splits a session into `levelCount` equal (or near-equal, for totals not
// evenly divisible) segments, escalating one level per segment starting
// from `startLevelIndex`. Clamps at the top level rather than wrapping or
// throwing once a player is already at or past the ramp's ceiling — a
// Master-tier player simply plays the whole session at Master.
export function buildRampedSession<T>(params: {
  totalItems: number
  levelCount: number
  startLevelIndex: number
  seed: number
  // Builds one segment's items at a given ramp level. Receives the exact
  // item count needed for that segment (always <= totalItems) and a seed
  // derived deterministically from the session seed, so the whole ramped
  // session remains reproducible for a given seed.
  buildSegment: (levelIndex: number, segmentItemCount: number, segmentSeed: number) => T[]
}): T[] {
  const { totalItems, levelCount, startLevelIndex, seed, buildSegment } = params
  if (totalItems <= 0 || levelCount <= 0) return []

  const segmentSize = Math.ceil(totalItems / levelCount)
  const results: T[] = []

  for (let segment = 0; segment < levelCount && results.length < totalItems; segment++) {
    const levelIndex = Math.min(startLevelIndex + segment, levelCount - 1)
    const remaining = totalItems - results.length
    const segmentItemCount = Math.min(segmentSize, remaining)
    const segmentSeed = seed + segment * 500009
    results.push(...buildSegment(levelIndex, segmentItemCount, segmentSeed))
  }

  return results
}

// ── Intra-session speed ramp (Fix 6) ────────────────────────────────────

// A gentle, automatic reduction in flash duration across the session's
// segments — distinct from the between-session adaptive speed system
// (which still governs what a player's NEXT session starts at). Steps
// through real SPEED_TIERS entries (never invents a duration outside the
// platform's tested set) starting from the player's current speed, one
// tier faster per segment, floor-clamped at the mission's own
// `minSpeedMs` so it can never become unfair regardless of how many
// segments there are.
export function computeSessionSpeedRamp(params: {
  startSpeedMs: SpeedMs
  segmentCount: number
  minSpeedMs: SpeedMs
}): SpeedMs[] {
  const { startSpeedMs, segmentCount, minSpeedMs } = params
  const startIndex = SPEED_TIERS.indexOf(startSpeedMs)
  const minIndex = SPEED_TIERS.indexOf(minSpeedMs)
  const ramp: SpeedMs[] = []
  for (let segment = 0; segment < segmentCount; segment++) {
    const candidateIndex = Math.min(startIndex + segment, minIndex, SPEED_TIERS.length - 1)
    ramp.push(SPEED_TIERS[candidateIndex]!)
  }
  return ramp
}

// ── Combo micro-feedback (Fix 7) ────────────────────────────────────────

// Elegant, understated phrasing for a consecutive-correct streak — never
// arcade/cartoon language, never shown for a combo below 2 (a single
// correct answer isn't a "streak"). Every mission using SessionProgress's
// existing comboCount prop gets this automatically; no per-mission copy.
export function comboMicroFeedback(combo: number): string | null {
  if (combo < 2) return null
  if (combo >= 10) return 'Outstanding'
  if (combo >= 7) return 'Excellent Focus'
  if (combo >= 5) return `Combo ×${combo}`
  if (combo >= 3) return `Combo ×${combo}`
  return 'Perfect'
}
