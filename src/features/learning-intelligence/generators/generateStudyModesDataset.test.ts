import { describe, expect, it } from 'vitest'
import { generateStudyModesDataset } from './generateStudyModesDataset'
import { makeConceptGraph } from '../testFixtures'

describe('generateStudyModesDataset', () => {
  it('marks concept/flashcard/quiz-question/practice-question/revision-block available when content exists', () => {
    const conceptGraph = makeConceptGraph()
    const dataset = generateStudyModesDataset({
      conceptGraph,
      flashcards: [{ id: 'f1', conceptId: 'concept-0', front: 'a', back: 'b' }],
      quizQuestions: [{ id: 'q1', conceptId: 'concept-0', prompt: 'p', options: [] }],
      practiceQuestions: [{ id: 'p1', conceptId: 'concept-0', prompt: 'p', guidance: 'g' }],
      revisionBlocks: [{ id: 'r1', conceptId: 'concept-0', summary: 's' }],
    })

    for (const type of ['concept', 'flashcard', 'quiz-question', 'practice-question', 'revision-block'] as const) {
      const entry = dataset.find((mode) => mode.objectType === type)
      expect(entry?.isAvailable).toBe(true)
      expect(entry?.itemCount).toBeGreaterThan(0)
    }
  })

  it('honestly reports summary/mind-map-node/teaching-outline as unavailable — no generator produces them yet', () => {
    const dataset = generateStudyModesDataset({
      conceptGraph: makeConceptGraph(),
      flashcards: [],
      quizQuestions: [],
      practiceQuestions: [],
      revisionBlocks: [],
    })

    for (const type of ['summary', 'mind-map-node', 'teaching-outline'] as const) {
      const entry = dataset.find((mode) => mode.objectType === type)
      expect(entry?.isAvailable).toBe(false)
      expect(entry?.itemCount).toBe(0)
    }
  })

  it('reports concept unavailable for an empty concept graph', () => {
    const dataset = generateStudyModesDataset({
      conceptGraph: makeConceptGraph({ concepts: [], edges: [] }),
      flashcards: [],
      quizQuestions: [],
      practiceQuestions: [],
      revisionBlocks: [],
    })
    expect(dataset.find((mode) => mode.objectType === 'concept')?.isAvailable).toBe(false)
  })

  it('covers exactly the eight known LearningObjectTypes, no more, no fewer', () => {
    const dataset = generateStudyModesDataset({
      conceptGraph: makeConceptGraph(),
      flashcards: [],
      quizQuestions: [],
      practiceQuestions: [],
      revisionBlocks: [],
    })
    expect(dataset).toHaveLength(8)
  })
})
