import type { ChunkDifficulty } from '@/core/universal-learning-engine/learning-chunk'
import type { DifficultyTier } from '@/types/exercise-engine'

// Exercise Asset Builder™ — the single source of truth for converting a
// Learning Asset's real ChunkDifficulty ('beginner' | 'intermediate' |
// 'advanced', UCE-3B's own enrichment scale) into the DifficultyTier
// every existing Quantum Speed Reading engine already expects (8 tiers:
// beginner, easy, medium, advanced, expert, elite, master, adaptive). No
// mapping between these two scales existed anywhere in this codebase
// before this sprint (confirmed against chunkDifficulty.ts, which only
// maps DifficultyTier -> session parameters, never the reverse
// direction) — every Tier-1 Exercise Asset depends on this one function.
//
// Deterministic by construction, not by convention: 'beginner' and
// 'advanced' are literal, identical tokens on both scales, so those two
// map to themselves — a real signal is never remapped to an adjacent
// tier just because a mapping table exists. 'intermediate' has no direct
// counterpart on the 8-tier scale; it maps to 'medium', the one tier
// this codebase's own DEFAULT_SCORING_RULES.difficultyMultiplier already
// treats as the neutral baseline (multiplier 1.0 — "neither easy nor
// hard"). A `null` difficulty (enrichment not yet run for this chunk, or
// genuinely undetected) receives the same 'medium' default — an honest
// "no signal yet" placeholder, never a fabricated specific tier.
export function mapChunkDifficultyToTier(difficulty: ChunkDifficulty | null): DifficultyTier {
  switch (difficulty) {
    case 'beginner':
      return 'beginner'
    case 'advanced':
      return 'advanced'
    case 'intermediate':
      return 'medium'
    case null:
      return 'medium'
    default:
      return 'medium'
  }
}
