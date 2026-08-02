import { describe, expect, it } from 'vitest'
import type { WordExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'
import { toWordFlashContentItems } from './toWordFlashContentItems'

const assets: WordExerciseAsset[] = [
  { id: 'w1', word: 'photosynthesis', wordLabel: 'photosynthesis', difficultyTier: 'beginner', locale: 'en', priority: 2, sourceObjectId: 'obj-1' },
  { id: 'w2', word: 'chlorophyll', wordLabel: 'chlorophyll', difficultyTier: 'medium', locale: 'en', priority: 1, sourceObjectId: null },
]

describe('toWordFlashContentItems', () => {
  it('maps word/wordLabel/difficultyTier/locale verbatim onto content/contentLabel/difficulty/locale', () => {
    const items = toWordFlashContentItems(assets)
    expect(items[0]).toMatchObject({ id: 'w1', content: 'photosynthesis', contentLabel: 'photosynthesis', difficulty: 'beginner', locale: 'en' })
  })

  it('tags every item ai-learning-studio', () => {
    const items = toWordFlashContentItems(assets)
    expect(items.every((item) => item.categories?.includes('ai-learning-studio'))).toBe(true)
  })

  it('carries sourceObjectId and priority into metadata for traceability', () => {
    const items = toWordFlashContentItems(assets)
    expect(items[0]?.metadata).toMatchObject({ sourceObjectId: 'obj-1', priority: 2 })
    expect(items[1]?.metadata).toMatchObject({ sourceObjectId: null, priority: 1 })
  })

  it('never throws and returns an empty array for no assets', () => {
    expect(toWordFlashContentItems([])).toEqual([])
  })
})
