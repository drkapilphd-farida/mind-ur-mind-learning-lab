// Memory Discovery™ adaptive flash speed — how long a single word/chunk/
// number stays visible during the RSVP-style sequential flash, tiered off
// the same Adaptive Difficulty Engine™ tier every other exercise on the
// platform already reads (sessionEngine's loadState). Sprint-2.1 FIX-12 —
// the actual per-tier values now live in `memoryTimingConfig.ts`, the one
// centralized timing configuration; this file is purely the lookup +
// real adaptive-multiplier application (FIX-03/FIX-04), never a second
// place new timing numbers get invented.

import type { DifficultyTier } from '@/types/exercise-engine'
import { OBSERVATION_TIER_MS, VERBAL_READING_MULTIPLIER } from './memoryTimingConfig'

// `adaptiveMultiplier` — Sprint-2.1's own real, invisible adjustment
// (Reading-Speed Awareness and/or in-session performance), defaulting to
// 1 (no change) so every existing caller keeps working unmodified.
export function perItemFlashMs(tier: DifficultyTier, adaptiveMultiplier = 1): number {
  return Math.round(OBSERVATION_TIER_MS[tier] * adaptiveMultiplier)
}

// Sprint-1.6 FIX-12 — "Dynamic Rhythm Engine: different content types
// should have different pacing... Word Memory: comfortable reading
// pace." Reading real words genuinely takes longer to register than
// glancing at a pure glyph (an emoji, a shape, a colour) — the base
// `perItemFlashMs` rate stays the shared "fast observation" pace for
// Visual Memory / Pattern & Sequence / Shape Recognition; real text
// content (Word Memory, Sentence Recall, Image Recall's own text
// labels) gets a real, modest multiplier on top of it instead of a
// second, disconnected timing table.
export function verbalFlashMs(tier: DifficultyTier, adaptiveMultiplier = 1): number {
  return Math.round(OBSERVATION_TIER_MS[tier] * VERBAL_READING_MULTIPLIER * adaptiveMultiplier)
}
