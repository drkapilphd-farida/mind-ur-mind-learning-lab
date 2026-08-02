import { describe, expect, it } from 'vitest'
import type { ChunkExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'
import { toChunkReadingContentItems } from './toChunkReadingContentItems'

const assets: ChunkExerciseAsset[] = [
  { id: 'c1', chunkText: 'deep focus training', wordCount: 3, difficultyTier: 'easy', sourceChapterId: 'chunk-1' },
  { id: 'c2', chunkText: 'photosynthesis converts light', wordCount: 3, difficultyTier: 'easy', sourceChapterId: 'chunk-1' },
]

describe('toChunkReadingContentItems', () => {
  it('maps chunkText/difficultyTier verbatim onto content/contentLabel/difficulty', () => {
    const items = toChunkReadingContentItems(assets)
    expect(items[0]).toMatchObject({ id: 'c1', content: 'deep focus training', contentLabel: 'deep focus training', difficulty: 'easy', locale: 'en' })
  })

  it('tags every item ai-learning-studio', () => {
    const items = toChunkReadingContentItems(assets)
    expect(items.every((item) => item.categories?.includes('ai-learning-studio'))).toBe(true)
  })

  it('carries sourceChapterId and wordCount into metadata', () => {
    const items = toChunkReadingContentItems(assets)
    expect(items[0]?.metadata).toMatchObject({ sourceChapterId: 'chunk-1', wordCount: 3 })
  })

  it('never throws and returns an empty array for no assets', () => {
    expect(toChunkReadingContentItems([])).toEqual([])
  })
})
