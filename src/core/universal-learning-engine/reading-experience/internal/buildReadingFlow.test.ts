import { describe, expect, it } from 'vitest'
import { makeBundle } from './testFixtures'
import { selectSessionAssets } from './selectSessionAssets'
import { buildReadingFlow } from './buildReadingFlow'

describe('buildReadingFlow', () => {
  it('produces exactly the six real, fixed stages in order', () => {
    const assets = selectSessionAssets(makeBundle())
    const stages = buildReadingFlow(assets, { idFactory: () => 'stage-id' })
    expect(stages.map((stage) => stage.type)).toEqual(['word', 'phrase', 'sentence', 'paragraph', 'chapter', 'completion'])
    expect(stages.map((stage) => stage.order)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('references real asset text/ids, never fabricated placeholders', () => {
    const assets = selectSessionAssets(makeBundle())
    const stages = buildReadingFlow(assets)
    const wordStage = stages.find((stage) => stage.type === 'word')!
    const paragraphStage = stages.find((stage) => stage.type === 'paragraph')!
    const chapterStage = stages.find((stage) => stage.type === 'chapter')!

    expect(wordStage.assetReferences).toEqual(assets.words.map((word) => word.word))
    expect(paragraphStage.assetReferences).toEqual(assets.paragraphs.map((paragraph) => paragraph.paragraphId))
    expect(chapterStage.assetReferences).toEqual(assets.learningObjects.map((object) => object.objectId))
  })

  it('gives the completion stage zero duration and no asset references', () => {
    const assets = selectSessionAssets(makeBundle())
    const stages = buildReadingFlow(assets)
    const completion = stages.find((stage) => stage.type === 'completion')!
    expect(completion.estimatedDurationSeconds).toBe(0)
    expect(completion.assetReferences).toEqual([])
  })

  it('computes real, positive durations for every content stage from real asset text', () => {
    const assets = selectSessionAssets(makeBundle())
    const stages = buildReadingFlow(assets)
    for (const stage of stages) {
      if (stage.type === 'completion') continue
      expect(stage.estimatedDurationSeconds).toBeGreaterThan(0)
    }
  })
})
