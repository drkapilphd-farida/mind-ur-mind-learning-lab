import { describe, it, expect } from 'vitest'
import {
  ADVANCED_PHRASE_CHALLENGE_TYPES,
  advancedPhraseChallengeShowsContext,
  advancedPhraseChallengePrompt,
} from './phraseAdvancedChallengeLibrary'

describe('ADVANCED_PHRASE_CHALLENGE_TYPES', () => {
  it('lists exactly the 6 types ported from Sentence Reading', () => {
    expect(ADVANCED_PHRASE_CHALLENGE_TYPES).toEqual(['main-idea', 'missing-word', 'meaning-match', 'correct-ending', 'key-idea', 'idea-category'])
  })
})

describe('advancedPhraseChallengeShowsContext', () => {
  it('missing-word, meaning-match, and correct-ending re-show context', () => {
    expect(advancedPhraseChallengeShowsContext('missing-word')).toBe(true)
    expect(advancedPhraseChallengeShowsContext('meaning-match')).toBe(true)
    expect(advancedPhraseChallengeShowsContext('correct-ending')).toBe(true)
  })

  it('main-idea, key-idea, and idea-category test blind recall — nothing re-shown', () => {
    expect(advancedPhraseChallengeShowsContext('main-idea')).toBe(false)
    expect(advancedPhraseChallengeShowsContext('key-idea')).toBe(false)
    expect(advancedPhraseChallengeShowsContext('idea-category')).toBe(false)
  })
})

describe('advancedPhraseChallengePrompt', () => {
  it('every built type has a non-empty, distinct prompt', () => {
    const prompts = ADVANCED_PHRASE_CHALLENGE_TYPES.map((type) => advancedPhraseChallengePrompt(type))
    for (const prompt of prompts) expect(prompt.length).toBeGreaterThan(0)
    expect(new Set(prompts).size).toBe(ADVANCED_PHRASE_CHALLENGE_TYPES.length)
  })

  it('prompt copy refers to "phrase", never "sentence"', () => {
    for (const type of ADVANCED_PHRASE_CHALLENGE_TYPES) {
      expect(advancedPhraseChallengePrompt(type).toLowerCase()).not.toContain('sentence')
    }
  })
})
