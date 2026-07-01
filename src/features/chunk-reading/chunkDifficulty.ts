// Chunk Difficulty™ — maps DifficultyTier to chunk reading parameters.
// Chunk size IS the difficulty variable for this exercise. Higher tier =
// more words per fixation, faster presentation.
// Uses the existing Sprint 5D difficulty infrastructure.

import type { DifficultyTier, SpeedMs } from '@/types/exercise-engine'

export type ChunkDifficultyProfile = {
  tier: DifficultyTier
  wordsPerChunk: number     // how many words in each stimulus group
  flashDurationMs: SpeedMs  // how long the chunk is visible
  itemsPerSession: number   // chunks per session
  requiredAccuracyToAdvance: number
  minSessionsBeforeAdvance: number
}

export const CHUNK_DIFFICULTY_PROFILES: Record<DifficultyTier, ChunkDifficultyProfile> = {
  beginner: { tier: 'beginner', wordsPerChunk: 2, flashDurationMs: 800,  itemsPerSession: 15, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  easy:     { tier: 'easy',     wordsPerChunk: 3, flashDurationMs: 700,  itemsPerSession: 20, requiredAccuracyToAdvance: 85, minSessionsBeforeAdvance: 2 },
  medium:   { tier: 'medium',   wordsPerChunk: 4, flashDurationMs: 600,  itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
  advanced: { tier: 'advanced', wordsPerChunk: 5, flashDurationMs: 500,  itemsPerSession: 25, requiredAccuracyToAdvance: 90, minSessionsBeforeAdvance: 3 },
  expert:   { tier: 'expert',   wordsPerChunk: 6, flashDurationMs: 400,  itemsPerSession: 25, requiredAccuracyToAdvance: 92, minSessionsBeforeAdvance: 4 },
  elite:    { tier: 'elite',    wordsPerChunk: 6, flashDurationMs: 300,  itemsPerSession: 30, requiredAccuracyToAdvance: 94, minSessionsBeforeAdvance: 5 },
  master:   { tier: 'master',   wordsPerChunk: 6, flashDurationMs: 200,  itemsPerSession: 30, requiredAccuracyToAdvance: 96, minSessionsBeforeAdvance: 5 },
  adaptive: { tier: 'adaptive', wordsPerChunk: 3, flashDurationMs: 600,  itemsPerSession: 20, requiredAccuracyToAdvance: 88, minSessionsBeforeAdvance: 3 },
}

export function getChunkProfile(tier: DifficultyTier): ChunkDifficultyProfile {
  return CHUNK_DIFFICULTY_PROFILES[tier]
}

export function chunkSizeLabel(wordsPerChunk: number): string {
  const labels: Record<number, string> = {
    2: '2-Word Chunks',
    3: '3-Word Chunks',
    4: '4-Word Chunks',
    5: '5-Word Chunks',
    6: '6-Word Chunks',
  }
  return labels[wordsPerChunk] ?? `${wordsPerChunk}-Word Chunks`
}
