import { describe, expect, it } from 'vitest'
import { generateQuiz } from './generateQuiz'
import { makeConceptGraph, makeExtractedContent } from '../testFixtures'

describe('generateQuiz', () => {
  it('produces exactly one question per concept', async () => {
    const conceptGraph = makeConceptGraph()
    const questions = await generateQuiz({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(questions).toHaveLength(conceptGraph.concepts.length)
  })

  it('gives every question exactly one correct option', async () => {
    const conceptGraph = makeConceptGraph()
    const questions = await generateQuiz({ conceptGraph, extractedContent: makeExtractedContent() })
    for (const question of questions) {
      expect(question.options.filter((option) => option.isCorrect)).toHaveLength(1)
    }
  })

  it('draws every option’s text from a real concept description in the graph', async () => {
    const conceptGraph = makeConceptGraph()
    const questions = await generateQuiz({ conceptGraph, extractedContent: makeExtractedContent() })
    const realDescriptions = new Set(conceptGraph.concepts.map((c) => c.description))
    for (const question of questions) {
      for (const option of question.options) {
        expect(realDescriptions.has(option.text)).toBe(true)
      }
    }
  })

  it('produces a single-option question honestly when only one concept exists', async () => {
    const conceptGraph = makeConceptGraph({
      concepts: [{ id: 'concept-0', title: 'Only One', description: 'The only concept.', relatedConceptIds: [] }],
      edges: [],
    })
    const questions = await generateQuiz({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(questions[0]?.options).toHaveLength(1)
    expect(questions[0]?.options[0]?.isCorrect).toBe(true)
  })

  it('is deterministic for the same graph', async () => {
    const conceptGraph = makeConceptGraph()
    const first = await generateQuiz({ conceptGraph, extractedContent: makeExtractedContent() })
    const second = await generateQuiz({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(second).toEqual(first)
  })
})
