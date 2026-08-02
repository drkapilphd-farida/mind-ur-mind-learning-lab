import { describe, expect, it } from 'vitest'
import { makeBlueprint } from './testFixtures'
import { buildParagraphAssets } from './buildParagraphAssets'

describe('buildParagraphAssets', () => {
  it('assigns the same real, deterministic paragraph id convention enhanceLearningObjects.ts uses', () => {
    const assets = buildParagraphAssets(makeBlueprint())
    expect(assets.map((asset) => asset.paragraphId)).toEqual(['chunk-1-paragraph-0', 'chunk-1-paragraph-1'])
  })

  it('extracts this paragraph own real first sentence as a deterministic summary, never a new AI summary', () => {
    const assets = buildParagraphAssets(makeBlueprint())
    expect(assets[0]?.summary).toBe('Photosynthesis converts light energy into chemical energy.')
  })

  it('lists every real Learning Object whose title this paragraph mentions', () => {
    const assets = buildParagraphAssets(makeBlueprint())
    expect(assets[0]?.relatedLearningObjects).toEqual(['obj-photosynthesis'])
    expect(assets[1]?.relatedLearningObjects).toEqual(expect.arrayContaining(['obj-photosynthesis', 'obj-respiration']))
  })
})
