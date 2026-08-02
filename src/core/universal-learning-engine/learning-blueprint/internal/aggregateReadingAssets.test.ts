import { describe, expect, it } from 'vitest'
import { makeChunk } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { aggregateReadingAssets } from './aggregateReadingAssets'

describe('aggregateReadingAssets', () => {
  it('reuses real keywords/importantTerms directly, with zero new AI', () => {
    const chunk = makeChunk('chunk-1', 0, 'Algebra introduces variables. Calculus builds on algebra.', {
      keywords: ['algebra', 'calculus'],
      importantTerms: ['variables'],
    })

    const result = aggregateReadingAssets(chunk)
    expect(result.keywords).toEqual(['algebra', 'calculus'])
    expect(result.keyPhrases).toEqual(['variables'])
  })

  it('deterministically picks real sentences containing a real keyword/term', () => {
    const chunk = makeChunk('chunk-1', 0, 'Algebra introduces variables. This sentence has nothing important. Calculus builds on algebra.', {
      keywords: ['algebra'],
    })

    const result = aggregateReadingAssets(chunk)
    expect(result.keySentences).toEqual(['Algebra introduces variables.', 'Calculus builds on algebra.'])
  })

  it('is honestly empty when there are no real significant terms to search for', () => {
    const chunk = makeChunk('chunk-1', 0, 'Some plain content with no real enrichment yet.')
    const result = aggregateReadingAssets(chunk)
    expect(result.keySentences).toEqual([])
  })

  it('returns the chunk’s own real paragraph blocks as keyParagraphs', () => {
    const chunk = makeChunk('chunk-1', 0, 'Paragraph text.')
    const result = aggregateReadingAssets(chunk)
    expect(result.keyParagraphs).toEqual(['Paragraph text.'])
  })
})
