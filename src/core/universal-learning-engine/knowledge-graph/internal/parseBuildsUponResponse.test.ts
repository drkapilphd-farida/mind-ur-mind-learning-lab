import { describe, expect, it } from 'vitest'
import { parseBuildsUponResponse } from './parseBuildsUponResponse'

const CHUNK_CONCEPTS = ['calculus']
const PRIOR_CONCEPTS = ['algebra', 'geometry']

describe('parseBuildsUponResponse', () => {
  it('parses a valid relationship', () => {
    const raw = JSON.stringify({ relationships: [{ concept: 'calculus', buildsOnConcept: 'algebra', confidence: 0.9 }] })
    expect(parseBuildsUponResponse(raw, CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toEqual([{ concept: 'calculus', buildsOnConcept: 'algebra', confidence: 0.9 }])
  })

  it('extracts JSON wrapped in a markdown code fence', () => {
    const raw = `\`\`\`json\n${JSON.stringify({ relationships: [{ concept: 'calculus', buildsOnConcept: 'algebra', confidence: 0.9 }] })}\n\`\`\``
    expect(parseBuildsUponResponse(raw, CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toHaveLength(1)
  })

  it('returns an empty array for the mock provider\'s natural-language response, not a crash', () => {
    expect(parseBuildsUponResponse('[mock Mock Provider reply via Mock Model] Acknowledged: "..."', CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toEqual([])
  })

  it('returns an empty array when relationships is missing or not an array', () => {
    expect(parseBuildsUponResponse(JSON.stringify({}), CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toEqual([])
    expect(parseBuildsUponResponse(JSON.stringify({ relationships: 'not an array' }), CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toEqual([])
  })

  it('drops a relationship naming a concept that was never offered to the model (a hallucination)', () => {
    const raw = JSON.stringify({ relationships: [{ concept: 'a concept that was never offered', buildsOnConcept: 'algebra', confidence: 0.9 }] })
    expect(parseBuildsUponResponse(raw, CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toEqual([])
  })

  it('drops a relationship whose buildsOnConcept was never offered', () => {
    const raw = JSON.stringify({ relationships: [{ concept: 'calculus', buildsOnConcept: 'a concept that was never offered', confidence: 0.9 }] })
    expect(parseBuildsUponResponse(raw, CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toEqual([])
  })

  it('drops a relationship with an out-of-range confidence', () => {
    const raw = JSON.stringify({ relationships: [{ concept: 'calculus', buildsOnConcept: 'algebra', confidence: 1.5 }] })
    expect(parseBuildsUponResponse(raw, CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toEqual([])
  })

  it('matches concept names case-insensitively against the offered lists', () => {
    const raw = JSON.stringify({ relationships: [{ concept: 'CALCULUS', buildsOnConcept: 'Algebra', confidence: 0.8 }] })
    expect(parseBuildsUponResponse(raw, CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toHaveLength(1)
  })

  it('keeps valid entries while dropping invalid ones from the same response', () => {
    const raw = JSON.stringify({
      relationships: [
        { concept: 'calculus', buildsOnConcept: 'algebra', confidence: 0.9 },
        { concept: 'hallucinated', buildsOnConcept: 'algebra', confidence: 0.9 },
      ],
    })
    expect(parseBuildsUponResponse(raw, CHUNK_CONCEPTS, PRIOR_CONCEPTS)).toEqual([{ concept: 'calculus', buildsOnConcept: 'algebra', confidence: 0.9 }])
  })
})
