import { describe, expect, it } from 'vitest'
import { buildTrueFalseQuestion } from './buildTrueFalseQuestion'
import type { AssessmentPassage } from '../selectAssessmentPassages'

function makePassage(chunkNodeId: string, concepts: readonly string[]): AssessmentPassage {
  return { stage: 'sentence', chunkNodeId, content: 'real content', wordCount: 80, enrichment: { concepts } }
}

describe('buildTrueFalseQuestion', () => {
  it('returns null, honestly, when this passage has no real concept/entity/misconception to state', () => {
    const passage = makePassage('chunk-1', [])
    expect(buildTrueFalseQuestion(passage, [passage])).toBeNull()
  })

  it('always builds exactly one True option and one False option, with exactly one marked correct', () => {
    const passage = makePassage('chunk-1', ['Photosynthesis'])
    const other = makePassage('chunk-2', ['Mitochondria'])

    const question = buildTrueFalseQuestion(passage, [passage, other])

    expect(question?.type).toBe('true-false')
    expect(question?.options.map((option) => option.value).sort()).toEqual(['False', 'True'])
    expect(question?.options.filter((option) => option.isCorrect)).toHaveLength(1)
  })

  it('is deterministic — the same real inputs always produce the same real question', () => {
    const passage = makePassage('chunk-1', ['Photosynthesis'])
    const other = makePassage('chunk-2', ['Mitochondria'])

    const first = buildTrueFalseQuestion(passage, [passage, other])
    const second = buildTrueFalseQuestion(passage, [passage, other])

    expect(first).toEqual(second)
  })
})
