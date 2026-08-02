import { describe, it, expect } from 'vitest'
import { SENTENCE_CHALLENGE_TYPES, sentenceChallengePrompt } from './sentenceChallengeLibrary'

describe('SENTENCE_CHALLENGE_TYPES', () => {
  it('lists exactly the 9 built types — True/False is not among them', () => {
    expect(SENTENCE_CHALLENGE_TYPES).toEqual([
      'todays-topic', 'true-statement', 'best-summary', 'main-idea',
      'not-mentioned', 'best-title', 'cause-effect', 'meaning-match', 'sequence',
    ])
  })
})

describe('sentenceChallengePrompt', () => {
  it('every built type has a non-empty, distinct prompt', () => {
    const prompts = SENTENCE_CHALLENGE_TYPES.map((type) => sentenceChallengePrompt(type))
    for (const prompt of prompts) expect(prompt.length).toBeGreaterThan(0)
    expect(new Set(prompts).size).toBe(SENTENCE_CHALLENGE_TYPES.length)
  })

  it('matches the brief\'s own example question text', () => {
    expect(sentenceChallengePrompt('todays-topic')).toBe("What was today's topic?")
    expect(sentenceChallengePrompt('true-statement')).toBe('Which statement is TRUE?')
    expect(sentenceChallengePrompt('best-summary')).toBe("Which sentence best summarizes today's lesson?")
    expect(sentenceChallengePrompt('main-idea')).toBe('What was the main idea?')
    expect(sentenceChallengePrompt('not-mentioned')).toBe('Which idea was NOT mentioned?')
    expect(sentenceChallengePrompt('best-title')).toBe('Choose the best title.')
    expect(sentenceChallengePrompt('meaning-match')).toBe('Which statement means the same?')
    expect(sentenceChallengePrompt('sequence')).toBe('Which sentence came first?')
  })
})
