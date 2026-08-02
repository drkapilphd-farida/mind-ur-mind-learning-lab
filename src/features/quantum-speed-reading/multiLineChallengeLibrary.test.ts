import { describe, it, expect } from 'vitest'
import {
  MULTI_LINE_CHALLENGE_TYPES,
  multiLineChallengeShowsContext,
  multiLineChallengePrompt,
  contentWords,
  lastWord,
  lineHasNumber,
} from './multiLineChallengeLibrary'

describe('MULTI_LINE_CHALLENGE_TYPES', () => {
  it('lists exactly the 5 built types — Type 7 (flash highlight) is not among them', () => {
    expect(MULTI_LINE_CHALLENGE_TYPES).toEqual(['keyword-line', 'ending-word-line', 'person-line', 'location-line', 'number-line'])
  })
})

describe('multiLineChallengeShowsContext', () => {
  it('keyword-line and ending-word-line reveal a target word', () => {
    expect(multiLineChallengeShowsContext('keyword-line')).toBe(true)
    expect(multiLineChallengeShowsContext('ending-word-line')).toBe(true)
  })

  it('person-line, location-line, and number-line are pure category recall — nothing revealed', () => {
    expect(multiLineChallengeShowsContext('person-line')).toBe(false)
    expect(multiLineChallengeShowsContext('location-line')).toBe(false)
    expect(multiLineChallengeShowsContext('number-line')).toBe(false)
  })
})

describe('multiLineChallengePrompt', () => {
  it('keyword-line and ending-word-line interpolate the context word into the prompt', () => {
    expect(multiLineChallengePrompt('keyword-line', 'mountain', 1)).toContain('mountain')
    expect(multiLineChallengePrompt('ending-word-line', 'today.', 1)).toContain('today.')
  })

  it('category types produce a fixed prompt regardless of context word', () => {
    expect(multiLineChallengePrompt('person-line', null, 1)).toBe('Which line mentioned a person?')
    expect(multiLineChallengePrompt('location-line', null, 1)).toBe('Which line mentioned a location?')
    expect(multiLineChallengePrompt('number-line', null, 1)).toBe('Which line contained a number?')
  })

  it('keyword-line prompt varies across seeds (two rotating variants)', () => {
    const seen = new Set<string>()
    for (let seed = 0; seed < 20; seed++) seen.add(multiLineChallengePrompt('keyword-line', 'word', seed))
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('contentWords', () => {
  it('filters out short words and common stopwords', () => {
    const words = contentWords('The brain adapts through daily practice.')
    expect(words).not.toContain('The')
    expect(words).not.toContain('the')
    expect(words.some((w) => w.toLowerCase() === 'brain')).toBe(true)
    expect(words.some((w) => w.toLowerCase() === 'practice')).toBe(true)
  })

  it('strips trailing punctuation from candidate words', () => {
    const words = contentWords('Reading becomes easier with practice.')
    expect(words).toContain('practice')
    expect(words).not.toContain('practice.')
  })
})

describe('lastWord', () => {
  it('returns the final word of a line with punctuation stripped', () => {
    expect(lastWord('Reading becomes easier with practice.')).toBe('practice')
    expect(lastWord('Which line mentioned a person')).toBe('person')
  })
})

describe('lineHasNumber', () => {
  it('detects a real numeral in the line', () => {
    expect(lineHasNumber('Water boils at 100 degrees.')).toBe(true)
    expect(lineHasNumber('In late 1989, the wall fell.')).toBe(true)
  })

  it('returns false when the line has no digit, even with spelled-out numbers', () => {
    expect(lineHasNumber('Trees release oxygen into the air.')).toBe(false)
    expect(lineHasNumber('Eighteen segments form the mirror.')).toBe(false)
  })
})
