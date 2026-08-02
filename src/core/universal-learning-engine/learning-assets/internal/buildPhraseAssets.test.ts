import { describe, expect, it } from 'vitest'
import { makeBlueprint } from './testFixtures'
import { buildPhraseAssets } from './buildPhraseAssets'

describe('buildPhraseAssets', () => {
  it('classifies a phrase matching a real Learning Object title as concept-phrase', () => {
    const assets = buildPhraseAssets(makeBlueprint())
    const conceptPhrase = assets.find((asset) => asset.phrase === 'cellular respiration')
    expect(conceptPhrase).toEqual({ phrase: 'cellular respiration', phraseType: 'concept-phrase', relatedLearningObject: 'obj-respiration' })
  })

  it('classifies a phrase found only in a real definition as definition-phrase', () => {
    const blueprint = makeBlueprint({ readingAssets: { keywords: [], keyPhrases: ['light into chemical'], keySentences: [], keyParagraphs: [] } })
    const assets = buildPhraseAssets(blueprint)
    expect(assets[0]).toEqual({ phrase: 'light into chemical', phraseType: 'definition-phrase', relatedLearningObject: 'obj-photosynthesis' })
  })

  it('honestly falls back to supporting-phrase when neither a concept nor a definition matches', () => {
    const blueprint = makeBlueprint({ readingAssets: { keywords: [], keyPhrases: ['completely unrelated wording'], keySentences: [], keyParagraphs: [] } })
    const assets = buildPhraseAssets(blueprint)
    expect(assets[0]).toEqual({ phrase: 'completely unrelated wording', phraseType: 'supporting-phrase', relatedLearningObject: null })
  })
})
