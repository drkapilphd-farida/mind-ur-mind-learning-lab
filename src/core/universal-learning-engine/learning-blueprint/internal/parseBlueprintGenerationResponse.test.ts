import { describe, expect, it } from 'vitest'
import { parseBlueprintGenerationResponse } from './parseBlueprintGenerationResponse'

const REAL_RESPONSE = JSON.stringify({
  conceptExplanations: [{ concept: 'algebra', explanation: 'Algebra is math with symbols instead of fixed numbers.' }],
  memoryHooks: ['Think of "x" as a mystery box.'],
  associations: ['Algebra ~ solving puzzles'],
  simpleMemoryNotes: ['Balance both sides of the equation.'],
  recallQuestions: [{ question: 'What does "x" represent?', expectedAnswerHint: 'An unknown value.' }],
  applicationQuestions: [{ scenario: 'You have 3 boxes with an unknown number of apples each, totaling 12.', question: 'How many apples are in each box?' }],
  aiMentorContext: {
    beginnerExplanation: 'Algebra lets us solve for unknown numbers.',
    simpleExplanation: 'It is math with letters standing in for numbers.',
    realLifeExample: 'Splitting a restaurant bill evenly uses algebra.',
    commonDoubts: ['Why use letters instead of numbers?'],
  },
})

describe('parseBlueprintGenerationResponse', () => {
  it('parses a real, well-formed response completely', () => {
    const result = parseBlueprintGenerationResponse(REAL_RESPONSE)
    expect(result.conceptExplanations).toEqual([{ concept: 'algebra', explanation: 'Algebra is math with symbols instead of fixed numbers.' }])
    expect(result.memoryHooks).toEqual(['Think of "x" as a mystery box.'])
    expect(result.recallQuestions).toEqual([{ question: 'What does "x" represent?', expectedAnswerHint: 'An unknown value.' }])
    expect(result.aiMentorContext.beginnerExplanation).toBe('Algebra lets us solve for unknown numbers.')
    expect(result.aiMentorContext.commonDoubts).toEqual(['Why use letters instead of numbers?'])
    expect(result.warnings).toEqual([])
  })

  it('honestly returns every field empty/null for a non-JSON response, never throwing', () => {
    const result = parseBlueprintGenerationResponse('This is not JSON at all.')
    expect(result.conceptExplanations).toEqual([])
    expect(result.memoryHooks).toEqual([])
    expect(result.aiMentorContext).toEqual({ beginnerExplanation: null, simpleExplanation: null, realLifeExample: null, commonDoubts: [] })
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('drops malformed entries rather than fabricating a fix, recording a real warning', () => {
    const result = parseBlueprintGenerationResponse(JSON.stringify({ conceptExplanations: [{ concept: 'algebra' }], memoryHooks: 'not-an-array' }))
    expect(result.conceptExplanations).toEqual([])
    expect(result.memoryHooks).toEqual([])
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('extracts JSON from a markdown code fence', () => {
    const fenced = '```json\n' + REAL_RESPONSE + '\n```'
    const result = parseBlueprintGenerationResponse(fenced)
    expect(result.conceptExplanations).toHaveLength(1)
  })
})
