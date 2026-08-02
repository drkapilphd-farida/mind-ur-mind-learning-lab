import { describe, expect, it } from 'vitest'
import { generateFlashcards } from './generateFlashcards'
import { makeConceptGraph, makeExtractedContent } from '../testFixtures'

describe('generateFlashcards', () => {
  it('produces exactly one flashcard per concept', async () => {
    const conceptGraph = makeConceptGraph()
    const flashcards = await generateFlashcards({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(flashcards).toHaveLength(conceptGraph.concepts.length)
  })

  it('draws front/back from the concept’s own real title/description', async () => {
    const conceptGraph = makeConceptGraph()
    const flashcards = await generateFlashcards({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(flashcards[0]).toMatchObject({ conceptId: 'concept-0', front: 'Introduction', back: 'An opening overview of the material.' })
  })

  it('returns an empty array for a document with no concepts', async () => {
    const conceptGraph = makeConceptGraph({ concepts: [], edges: [] })
    const flashcards = await generateFlashcards({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(flashcards).toEqual([])
  })
})
