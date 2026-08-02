import type { ContentItem } from '@/types/exercise-engine'
import type { ChunkExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2: Reading Experience
// Integration™. Same rationale as toWordFlashContentItems.ts: maps
// ChunkExerciseAsset[] straight into a ContentItem[] pool scoped to one
// document's own chapter, bypassing the dataset registry entirely so the
// pool a Quantum Reading Journey™ chapter draws from is never mixed with
// unrelated hand-authored platform chunks. Handed directly to
// progressiveChunkReadingEngine.ts's own buildProgressiveChunkReadingBlock
// — the same distractor-building function Progressive Chunk Reading
// itself calls.
export function toChunkReadingContentItems(assets: readonly ChunkExerciseAsset[]): ContentItem[] {
  return assets.map((asset) => ({
    id: asset.id,
    content: asset.chunkText,
    contentLabel: asset.chunkText,
    difficulty: asset.difficultyTier,
    locale: 'en',
    categories: ['ai-learning-studio'],
    metadata: { sourceChapterId: asset.sourceChapterId, wordCount: asset.wordCount },
  }))
}
