import { createDataset } from '@/lib/exercise-engine/contentEngine'
import type { ContentDataset } from '@/types/exercise-engine'
import type { WordExerciseAsset, ChunkExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'

// Reading Intelligence Engine™ Upgrade — Sprint QSR-1: Exercise Asset
// Builder™ (Tier-1) — Registration. The one integration point between
// the (framework-free) Exercise Asset Builder and the existing Quantum
// Speed Reading engines: it calls the SAME createDataset()/
// registerDataset() seam every hand-authored dataset already uses
// (wordFlashDataset.ts, chunkDataset.ts), so Word Flash, Flash Words™,
// Progressive Chunk Reading, and legacy Chunk Reading pick up a
// document-derived pool through getContentForExercise() exactly like
// they already pick up a hand-authored one — zero engine changes, per
// Sprint QSR-0.75's own "Current: Hardcoded Dataset -> Engine / Future:
// Exercise Asset Builder -> Registered Dataset -> Existing Engine" plan.
//
// `category: 'ai-learning-studio'` is the literal DatasetCategory this
// codebase's own type file already reserved for exactly this purpose
// (Sprint QSR-0's headline finding) — every item registered here is
// tagged with it, so a future query can distinguish document-derived
// content from hand-authored content without either pool needing to
// know the other exists.
//
// This function assumes its input has already passed
// validateWordExerciseAssets/validateChunkExerciseAssets (see the core
// Exercise Asset Builder module) — it does not re-validate, matching the
// Builder/Registration split this sprint establishes: the Builder
// decides whether the data is well-formed, this layer only decides
// where it goes.

export function registerWordExerciseAssetDataset(documentId: string, chapterId: string, assets: readonly WordExerciseAsset[]): ContentDataset {
  return createDataset({
    id: `ai-learning-studio-word-${documentId}-${chapterId}`,
    locale: assets[0]?.locale ?? 'en',
    contentType: 'word',
    rawItems: assets.map((asset) => ({
      content: asset.word,
      difficulty: asset.difficultyTier,
      categories: ['ai-learning-studio'],
      metadata: { exerciseAssetId: asset.id, sourceObjectId: asset.sourceObjectId, priority: asset.priority },
    })),
  })
}

export function registerChunkExerciseAssetDataset(documentId: string, chapterId: string, assets: readonly ChunkExerciseAsset[]): ContentDataset {
  return createDataset({
    id: `ai-learning-studio-chunk-${documentId}-${chapterId}`,
    locale: 'en',
    contentType: 'chunk',
    rawItems: assets.map((asset) => ({
      content: asset.chunkText,
      difficulty: asset.difficultyTier,
      categories: ['ai-learning-studio'],
      metadata: { exerciseAssetId: asset.id, sourceChapterId: asset.sourceChapterId },
    })),
  })
}
