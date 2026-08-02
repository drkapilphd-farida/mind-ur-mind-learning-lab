import { describe, expect, it } from 'vitest'
import { getDataset } from '@/lib/exercise-engine/contentEngine'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import type { WordExerciseAsset, ChunkExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'
import { registerWordExerciseAssetDataset, registerChunkExerciseAssetDataset } from './registerExerciseAssetDatasets'

const wordAssets: WordExerciseAsset[] = [
  { id: 'w1', word: 'focus', wordLabel: 'focus', difficultyTier: 'easy', locale: 'en', priority: 2, sourceObjectId: 'obj-1' },
  { id: 'w2', word: 'clarity', wordLabel: 'clarity', difficultyTier: 'medium', locale: 'en', priority: 1, sourceObjectId: null },
]

const chunkAssets: ChunkExerciseAsset[] = [{ id: 'c1', chunkText: 'deep focus training', wordCount: 3, difficultyTier: 'easy', sourceChapterId: 'chunk-1' }]

describe('registerWordExerciseAssetDataset', () => {
  it('registers a dataset findable by getDataset, tagged ai-learning-studio', () => {
    const dataset = registerWordExerciseAssetDataset('doc-1', 'chunk-1', wordAssets)
    expect(getDataset(dataset.id)).toBe(dataset)
    expect(dataset.contentType).toBe('word')
    expect(dataset.items.every((item) => item.categories?.includes('ai-learning-studio'))).toBe(true)
  })

  it('is queryable through the same getContentForExercise() seam Word Flash already uses', () => {
    registerWordExerciseAssetDataset('doc-2', 'chunk-2', wordAssets)
    const items = getContentForExercise({ contentType: 'word', locale: 'en', difficulty: 'easy', count: 10, seed: 1 })
    expect(items.some((item) => item.content === 'focus')).toBe(true)
  })
})

describe('registerChunkExerciseAssetDataset', () => {
  it('registers a dataset findable by getDataset, tagged ai-learning-studio', () => {
    const dataset = registerChunkExerciseAssetDataset('doc-1', 'chunk-1', chunkAssets)
    expect(getDataset(dataset.id)).toBe(dataset)
    expect(dataset.contentType).toBe('chunk')
    expect(dataset.items[0]?.content).toBe('deep focus training')
  })
})
