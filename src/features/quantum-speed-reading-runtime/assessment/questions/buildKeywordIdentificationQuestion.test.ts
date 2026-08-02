import { describe, expect, it } from 'vitest'
import { buildKeywordIdentificationQuestion } from './buildKeywordIdentificationQuestion'
import type { AssessmentPassage } from '../selectAssessmentPassages'

function makePassage(chunkNodeId: string, keywords: readonly string[]): AssessmentPassage {
  return { stage: 'word-chunk', chunkNodeId, content: 'real content', wordCount: 80, enrichment: { keywords } }
}

describe('buildKeywordIdentificationQuestion', () => {
  it('returns null, honestly, when this passage has no real keywords', () => {
    const passage = makePassage('chunk-1', [])
    expect(buildKeywordIdentificationQuestion(passage, [passage])).toBeNull()
  })

  it('returns null when no other real passage has a distractor keyword', () => {
    const passage = makePassage('chunk-1', ['Alpha'])
    expect(buildKeywordIdentificationQuestion(passage, [passage])).toBeNull()
  })

  it('builds a real question with exactly one correct real keyword from this passage', () => {
    const passage = makePassage('chunk-1', ['Alpha'])
    const other = makePassage('chunk-2', ['Beta', 'Gamma'])

    const question = buildKeywordIdentificationQuestion(passage, [passage, other])

    expect(question?.type).toBe('keyword-identification')
    expect(question?.options.filter((option) => option.isCorrect)).toEqual([{ value: 'Alpha', isCorrect: true }])
    expect(question?.options.map((option) => option.value)).toContain('Alpha')
  })

  it('is deterministic — the same real inputs always produce the same real question', () => {
    const passage = makePassage('chunk-1', ['Alpha', 'Delta'])
    const other = makePassage('chunk-2', ['Beta', 'Gamma'])

    const first = buildKeywordIdentificationQuestion(passage, [passage, other])
    const second = buildKeywordIdentificationQuestion(passage, [passage, other])

    expect(first).toEqual(second)
  })
})
