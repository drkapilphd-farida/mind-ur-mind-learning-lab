import { describe, expect, it } from 'vitest'
import { makeBundle } from './testFixtures'
import { buildWordExerciseAssets } from './buildWordExerciseAssets'

describe('buildWordExerciseAssets', () => {
  it('maps WordAsset.word to word/wordLabel verbatim', () => {
    const assets = buildWordExerciseAssets(makeBundle())
    expect(assets.map((a) => a.word)).toEqual(['photosynthesis', 'respiration', 'chlorophyll'])
    expect(assets.every((a) => a.wordLabel === a.word)).toBe(true)
  })

  it('preserves priority and sourceObjectId (learningObjectReference) verbatim', () => {
    const assets = buildWordExerciseAssets(makeBundle())
    expect(assets[0]).toMatchObject({ priority: 2, sourceObjectId: 'obj-photosynthesis' })
    expect(assets[2]).toMatchObject({ priority: 0, sourceObjectId: null })
  })

  it('joins learningObjectReference to the object and derives difficultyTier from its real difficulty', () => {
    const assets = buildWordExerciseAssets(makeBundle())
    // obj-photosynthesis has ChunkDifficulty 'beginner' -> DifficultyTier 'beginner'
    expect(assets[0]?.difficultyTier).toBe('beginner')
    // obj-respiration has ChunkDifficulty 'intermediate' -> DifficultyTier 'medium'
    expect(assets[1]?.difficultyTier).toBe('medium')
  })

  it('degrades an unresolvable reference to the medium default rather than throwing', () => {
    const assets = buildWordExerciseAssets(makeBundle())
    // chlorophyll has no learningObjectReference at all
    expect(assets[2]?.difficultyTier).toBe('medium')
  })

  it('defaults locale to en and honors an explicit override', () => {
    expect(buildWordExerciseAssets(makeBundle())[0]?.locale).toBe('en')
    expect(buildWordExerciseAssets(makeBundle(), { locale: 'hi' })[0]?.locale).toBe('hi')
  })

  it('produces stable, unique ids by default', () => {
    const assets = buildWordExerciseAssets(makeBundle())
    const ids = assets.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(assets[0]?.id).toBe('chunk-1-word-0-photosynthesis')
  })

  it('never throws and returns an empty array for a chapter with no word assets', () => {
    const assets = buildWordExerciseAssets(makeBundle({ wordAssets: [] }))
    expect(assets).toEqual([])
  })
})
