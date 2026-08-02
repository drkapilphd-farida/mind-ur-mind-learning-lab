import { describe, it, expect } from 'vitest'
import {
  PHRASE_CHALLENGE_TYPES_BY_LEVEL,
  PHRASE_CHALLENGE_PROMPTS,
  getAllowedChallengeTypes,
  pickChallengeType,
  challengeTypeShowsContext,
  type PhraseChallengeType,
} from './phraseChallengeLibrary'
import type { PhraseReadingLevel } from './phraseDifficulty'

const LEVELS: PhraseReadingLevel[] = [1, 2, 3, 4, 5]
const ALL_TYPES: PhraseChallengeType[] = ['exact-recognition', 'missing-word', 'phrase-completion', 'meaning-match', 'phrase-order']

describe('PHRASE_CHALLENGE_TYPES_BY_LEVEL', () => {
  it('matches the locked level design: 1+2, 1+2+3, 1+2+3+4, 1+2+3+4+5, 1+2+3+4+5 (6/7 deferred)', () => {
    expect(PHRASE_CHALLENGE_TYPES_BY_LEVEL[1]).toEqual(['exact-recognition', 'missing-word'])
    expect(PHRASE_CHALLENGE_TYPES_BY_LEVEL[2]).toEqual(['exact-recognition', 'missing-word', 'phrase-completion'])
    expect(PHRASE_CHALLENGE_TYPES_BY_LEVEL[3]).toEqual(['exact-recognition', 'missing-word', 'phrase-completion', 'meaning-match'])
    expect(PHRASE_CHALLENGE_TYPES_BY_LEVEL[4]).toEqual(['exact-recognition', 'missing-word', 'phrase-completion', 'meaning-match', 'phrase-order'])
    expect(PHRASE_CHALLENGE_TYPES_BY_LEVEL[5]).toEqual(['exact-recognition', 'missing-word', 'phrase-completion', 'meaning-match', 'phrase-order'])
  })

  it('the allowed type set only ever grows as level increases, never shrinks', () => {
    let lastCount = 0
    for (const level of LEVELS) {
      const count = PHRASE_CHALLENGE_TYPES_BY_LEVEL[level].length
      expect(count).toBeGreaterThanOrEqual(lastCount)
      lastCount = count
    }
  })

  it('getAllowedChallengeTypes matches the table', () => {
    for (const level of LEVELS) {
      expect(getAllowedChallengeTypes(level)).toEqual(PHRASE_CHALLENGE_TYPES_BY_LEVEL[level])
    }
  })
})

describe('pickChallengeType', () => {
  it('only ever picks a type allowed at that level', () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < 20; seed++) {
        expect(PHRASE_CHALLENGE_TYPES_BY_LEVEL[level]).toContain(pickChallengeType(level, seed))
      }
    }
  })

  it('is deterministic for a given level + seed', () => {
    expect(pickChallengeType(3, 42)).toBe(pickChallengeType(3, 42))
  })

  it('varies across seeds once more than one type is allowed', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 30; seed++) seen.add(pickChallengeType(4, seed))
    expect(seen.size).toBeGreaterThan(1)
  })

  it('always picks exact-recognition at Level 1 has more than one option, but never an out-of-level type', () => {
    for (let seed = 0; seed < 30; seed++) {
      const picked = pickChallengeType(1, seed)
      expect(['exact-recognition', 'missing-word']).toContain(picked)
    }
  })
})

describe('PHRASE_CHALLENGE_PROMPTS', () => {
  it('defines a prompt for every challenge type', () => {
    for (const type of ALL_TYPES) {
      expect(PHRASE_CHALLENGE_PROMPTS[type]).toBeTruthy()
    }
  })
})

describe('challengeTypeShowsContext', () => {
  it('missing-word, phrase-completion, and meaning-match re-show context', () => {
    expect(challengeTypeShowsContext('missing-word')).toBe(true)
    expect(challengeTypeShowsContext('phrase-completion')).toBe(true)
    expect(challengeTypeShowsContext('meaning-match')).toBe(true)
  })

  it('exact-recognition and phrase-order test blind recall — nothing re-shown', () => {
    expect(challengeTypeShowsContext('exact-recognition')).toBe(false)
    expect(challengeTypeShowsContext('phrase-order')).toBe(false)
  })
})
