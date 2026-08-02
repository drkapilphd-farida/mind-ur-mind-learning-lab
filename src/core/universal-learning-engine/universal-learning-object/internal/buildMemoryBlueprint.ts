import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { MemoryBlueprint } from '../types/LearningIntelligence'

// Universal Learning Object™ (UCE-6). Pure. Real re-sort of UCE-5's own
// `chunkAnalyses` by real `memoryDifficulty`, descending — the chunks
// hardest to retain surfaced first.
export function buildMemoryBlueprint(analysis: LearningAnalysis): MemoryBlueprint {
  const entries = [...analysis.chunkAnalyses]
    .sort((a, b) => b.memoryDifficulty - a.memoryDifficulty)
    .map((chunk) => ({ chunkNodeId: chunk.chunkNodeId, memoryDifficulty: chunk.memoryDifficulty }))

  return { entries }
}
