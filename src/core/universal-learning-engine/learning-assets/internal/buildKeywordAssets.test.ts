import { describe, expect, it } from 'vitest'
import { makeBlueprint } from './testFixtures'
import { buildKeywordAssets } from './buildKeywordAssets'

describe('buildKeywordAssets', () => {
  it('reuses every real Blueprint keyword verbatim, one asset each', () => {
    const assets = buildKeywordAssets(makeBlueprint())
    expect(assets.map((asset) => asset.keyword)).toEqual(['photosynthesis', 'chlorophyll', 'respiration'])
  })

  it('references the real Learning Object whose title this keyword concerns', () => {
    const assets = buildKeywordAssets(makeBlueprint())
    const photosynthesis = assets.find((asset) => asset.keyword === 'photosynthesis')
    expect(photosynthesis?.learningObjectReference).toBe('obj-photosynthesis')
  })

  it('is honestly null when no real Learning Object matches', () => {
    const assets = buildKeywordAssets(makeBlueprint())
    const chlorophyll = assets.find((asset) => asset.keyword === 'chlorophyll')
    expect(chlorophyll?.learningObjectReference).toBeNull()
  })
})
