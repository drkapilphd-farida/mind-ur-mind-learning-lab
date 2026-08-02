import { describe, expect, it } from 'vitest'
import { makeBlueprint, FIXED_NOW } from './internal/testFixtures'
import { buildLearningAssets } from './buildLearningAssets'

describe('buildLearningAssets', () => {
  it('builds a complete bundle from a real Blueprint alone, with all five asset categories populated', () => {
    const bundle = buildLearningAssets(makeBlueprint(), { now: FIXED_NOW, idFactory: () => 'bundle-1' })

    expect(bundle).toMatchObject({
      bundleId: 'bundle-1',
      documentId: 'doc-1',
      chapterId: 'chunk-1',
      version: 1,
      createdAt: FIXED_NOW().toISOString(),
    })
    expect(bundle.learningObjects).toHaveLength(2)
    expect(bundle.keywordAssets).toHaveLength(3)
    expect(bundle.wordAssets).toHaveLength(3)
    expect(bundle.phraseAssets).toHaveLength(2)
    expect(bundle.sentenceAssets).toHaveLength(2)
    expect(bundle.paragraphAssets).toHaveLength(2)
  })

  it('never calls any AI — the same real Blueprint input always produces the same real output', () => {
    const first = buildLearningAssets(makeBlueprint(), { now: FIXED_NOW, idFactory: () => 'bundle-1' })
    const second = buildLearningAssets(makeBlueprint(), { now: FIXED_NOW, idFactory: () => 'bundle-1' })
    expect(first).toEqual(second)
  })
})
