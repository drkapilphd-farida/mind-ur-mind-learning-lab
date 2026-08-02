import { describe, expect, it } from 'vitest'
import { makeBundle } from './testFixtures'
import { selectSessionAssets } from './selectSessionAssets'

describe('selectSessionAssets', () => {
  it('sorts words by real descending priority', () => {
    const selected = selectSessionAssets(makeBundle())
    expect(selected.words.map((word) => word.word)).toEqual(['photosynthesis', 'respiration'])
  })

  it('sorts phrases by real phraseType rank (concept before definition before supporting)', () => {
    const selected = selectSessionAssets(makeBundle())
    expect(selected.phrases.map((phrase) => phrase.phrase)).toEqual(['cellular respiration', 'light into chemical'])
  })

  it('sorts sentences by real descending importance', () => {
    const selected = selectSessionAssets(makeBundle())
    expect(selected.sentences.map((sentence) => sentence.keySentence)).toEqual([
      'Photosynthesis converts light energy into chemical energy.',
      'Cellular respiration reverses photosynthesis.',
    ])
  })

  it('sorts paragraphs by real paragraphId reading order, not importance', () => {
    const bundle = makeBundle()
    const reversed = { ...bundle, paragraphAssets: [...bundle.paragraphAssets].reverse() }
    const selected = selectSessionAssets(reversed)
    expect(selected.paragraphs.map((paragraph) => paragraph.paragraphId)).toEqual(['chunk-1-paragraph-0', 'chunk-1-paragraph-1'])
  })

  it('deduplicates real duplicate words/phrases/sentences/paragraphs by normalized text', () => {
    const bundle = makeBundle()
    const withDuplicate = {
      ...bundle,
      wordAssets: [...bundle.wordAssets, { word: 'Photosynthesis', priority: 0.1, learningObjectReference: null }],
    }
    const selected = selectSessionAssets(withDuplicate)
    expect(selected.words).toHaveLength(2)
  })

  it('passes learningObjects through unsequenced — sequencing is Adaptive Sequencing Engine own job', () => {
    const bundle = makeBundle()
    const selected = selectSessionAssets(bundle)
    expect(selected.learningObjects).toBe(bundle.learningObjects)
  })
})
