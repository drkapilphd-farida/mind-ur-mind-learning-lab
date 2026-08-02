import { describe, expect, it } from 'vitest'
import { makeChunk } from '@/core/universal-learning-engine/universal-learning-object/testFixtures'
import { buildStructuralAssessmentItems } from './buildStructuralAssessmentItems'

describe('buildStructuralAssessmentItems', () => {
  it('builds a real, deterministic MCQ from real definitions, using other real definitions as distractors', () => {
    const chunk = makeChunk('chunk-1', 0, 'content', {
      definitions: [
        { term: 'algebra', definition: 'A branch of mathematics using symbols.' },
        { term: 'calculus', definition: 'The mathematical study of continuous change.' },
      ],
    })

    const { mcqs } = buildStructuralAssessmentItems(chunk)
    expect(mcqs).toHaveLength(2)
    expect(mcqs[0]?.question).toBe('What is the definition of "algebra"?')
    expect(mcqs[0]?.options[0]).toBe('A branch of mathematics using symbols.')
    expect(mcqs[0]?.options).toContain('The mathematical study of continuous change.')
    expect(mcqs[0]?.correctAnswerIndex).toBe(0)
  })

  it('never builds an MCQ with no real distractor available', () => {
    const chunk = makeChunk('chunk-1', 0, 'content', { definitions: [{ term: 'algebra', definition: 'A branch of mathematics.' }] })
    const { mcqs } = buildStructuralAssessmentItems(chunk)
    expect(mcqs).toEqual([])
  })

  it('builds real true statements from definitions and real false statements from misconceptions', () => {
    const chunk = makeChunk('chunk-1', 0, 'content', {
      definitions: [{ term: 'algebra', definition: 'A branch of mathematics.' }],
      misconceptions: ['algebra is only about letters'],
    })

    const { trueFalse } = buildStructuralAssessmentItems(chunk)
    expect(trueFalse).toEqual([
      { statement: 'algebra: A branch of mathematics.', isTrue: true },
      { statement: 'algebra is only about letters', isTrue: false },
    ])
  })
})
