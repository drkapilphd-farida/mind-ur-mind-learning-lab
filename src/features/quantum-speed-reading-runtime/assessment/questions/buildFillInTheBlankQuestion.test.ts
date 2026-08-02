import { describe, expect, it } from 'vitest'
import { buildFillInTheBlankQuestion } from './buildFillInTheBlankQuestion'
import type { AssessmentPassage } from '../selectAssessmentPassages'

function makePassage(chunkNodeId: string, definitions: readonly { term: string; definition: string }[]): AssessmentPassage {
  return { stage: 'paragraph', chunkNodeId, content: 'real content', wordCount: 80, enrichment: { definitions } }
}

describe('buildFillInTheBlankQuestion', () => {
  it('returns null, honestly, when this passage has no real term/definition pairs', () => {
    const passage = makePassage('chunk-1', [])
    expect(buildFillInTheBlankQuestion(passage, [passage])).toBeNull()
  })

  it('returns null when no other real passage has a distractor term', () => {
    const passage = makePassage('chunk-1', [{ term: 'Osmosis', definition: 'The movement of water across a membrane.' }])
    expect(buildFillInTheBlankQuestion(passage, [passage])).toBeNull()
  })

  it('builds a real question with the correct real term and the real definition as the prompt', () => {
    const passage = makePassage('chunk-1', [{ term: 'Osmosis', definition: 'The movement of water across a membrane.' }])
    const other = makePassage('chunk-2', [{ term: 'Diffusion', definition: 'The spread of particles from high to low concentration.' }])

    const question = buildFillInTheBlankQuestion(passage, [passage, other])

    expect(question?.type).toBe('fill-in-the-blank')
    expect(question?.prompt).toContain('The movement of water across a membrane.')
    expect(question?.options.filter((option) => option.isCorrect)).toEqual([{ value: 'Osmosis', isCorrect: true }])
  })
})
