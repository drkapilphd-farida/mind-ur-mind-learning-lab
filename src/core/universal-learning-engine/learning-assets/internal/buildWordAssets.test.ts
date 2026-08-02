import { describe, expect, it } from 'vitest'
import { makeBlueprint } from './testFixtures'
import { buildWordAssets } from './buildWordAssets'

describe('buildWordAssets', () => {
  it('assigns a real, deterministic descending priority by real keyword rank order', () => {
    const assets = buildWordAssets(makeBlueprint())
    expect(assets[0]?.priority).toBe(1)
    expect(assets[assets.length - 1]?.priority).toBe(0)
    expect(assets[0]!.priority).toBeGreaterThan(assets[1]!.priority)
  })

  it('never throws and gives full priority to a single-keyword chapter', () => {
    const single = makeBlueprint({ readingAssets: { keywords: ['photosynthesis'], keyPhrases: [], keySentences: [], keyParagraphs: [] } })
    const assets = buildWordAssets(single)
    expect(assets).toEqual([{ word: 'photosynthesis', priority: 1, learningObjectReference: 'obj-photosynthesis' }])
  })
})
