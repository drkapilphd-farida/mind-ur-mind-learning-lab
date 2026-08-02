import { describe, expect, it } from 'vitest'
import { makeBlueprint } from './testFixtures'
import { buildSentenceAssets } from './buildSentenceAssets'

describe('buildSentenceAssets', () => {
  it('reuses every real Blueprint key sentence verbatim', () => {
    const assets = buildSentenceAssets(makeBlueprint())
    expect(assets.map((asset) => asset.keySentence)).toEqual(['Photosynthesis converts light energy into chemical energy.', 'Cellular respiration reverses photosynthesis.'])
  })

  it('scores the densest real sentence at importance 1, relative to its real peers', () => {
    const assets = buildSentenceAssets(makeBlueprint())
    expect(Math.max(...assets.map((asset) => asset.importance))).toBe(1)
    assets.forEach((asset) => {
      expect(asset.importance).toBeGreaterThanOrEqual(0)
      expect(asset.importance).toBeLessThanOrEqual(1)
    })
  })

  it('references the real Learning Object this sentence explains, when its title is mentioned', () => {
    const assets = buildSentenceAssets(makeBlueprint())
    const photosynthesisSentence = assets.find((asset) => asset.keySentence.startsWith('Photosynthesis converts'))
    expect(photosynthesisSentence?.explanationReference).toBe('obj-photosynthesis')
  })
})
