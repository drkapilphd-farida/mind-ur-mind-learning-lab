import { describe, expect, it } from 'vitest'
import { generatePractice } from './generatePractice'
import { makeConceptGraph, makeExtractedContent } from '../testFixtures'

describe('generatePractice', () => {
  it('produces exactly one practice question per concept', async () => {
    const conceptGraph = makeConceptGraph()
    const questions = await generatePractice({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(questions).toHaveLength(conceptGraph.concepts.length)
  })

  it('mentions the concept title in the prompt and reuses its description as guidance', async () => {
    const conceptGraph = makeConceptGraph()
    const questions = await generatePractice({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(questions[0]?.prompt).toContain('Introduction')
    expect(questions[0]?.guidance).toBe('An opening overview of the material.')
  })
})
