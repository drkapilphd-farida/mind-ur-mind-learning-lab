import { describe, it, expect } from 'vitest'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import { ADVANCED_PHRASES, getAdvancedPhrasesForLevel, advancedPhraseWordCount } from './phraseAdvancedLibrary'

const ALL_TOPICS = [
  'focus', 'memory', 'recognition', 'comprehension', 'reading-speed', 'habits', 'confidence',
  'concentration', 'processing', 'fluency', 'attention', 'consistency', 'visual-training',
  'mental-clarity', 'skill-building',
]

describe('ADVANCED_PHRASES', () => {
  it('defines at least one phrase', () => {
    expect(ADVANCED_PHRASES.length).toBeGreaterThan(0)
  })

  it('every phrase is 6-8 words — Level 5\'s locked word range', () => {
    for (const phrase of ADVANCED_PHRASES) {
      const count = advancedPhraseWordCount(phrase.text)
      expect(count).toBeGreaterThanOrEqual(6)
      expect(count).toBeLessThanOrEqual(8)
    }
  })

  it('no phrase ends with terminal punctuation — a phrase, never a complete sentence', () => {
    for (const phrase of ADVANCED_PHRASES) {
      expect(phrase.text.trim()).not.toMatch(/[.!?]$/)
    }
  })

  it('no phrase is capitalized like a sentence opener', () => {
    for (const phrase of ADVANCED_PHRASES) {
      expect(phrase.text[0]).toBe(phrase.text[0]?.toLowerCase())
    }
  })

  it('every phrase passes the Visual Width Validator (checked at the strictest role)', () => {
    for (const phrase of ADVANCED_PHRASES) {
      expect(isVisuallyValid(phrase.text, 'option')).toBe(true)
    }
  })

  it('every phrase has a real topic, gloss, and keyWord', () => {
    for (const phrase of ADVANCED_PHRASES) {
      expect(ALL_TOPICS).toContain(phrase.topic)
      expect(phrase.gloss.length).toBeGreaterThan(0)
      expect(phrase.keyWord.length).toBeGreaterThan(0)
    }
  })

  it('no duplicate phrase text', () => {
    const texts = ADVANCED_PHRASES.map((p) => p.text)
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('has at least one phrase supporting each optional Challenge Library field', () => {
    expect(ADVANCED_PHRASES.some((p) => p.missingWord)).toBe(true)
    expect(ADVANCED_PHRASES.some((p) => p.meaningMatch)).toBe(true)
    expect(ADVANCED_PHRASES.some((p) => p.correctEnding)).toBe(true)
  })

  it('missingWord/correctEnding options and meaningMatch distractors are each exactly 4 or 3 well-formed entries', () => {
    for (const phrase of ADVANCED_PHRASES) {
      if (phrase.missingWord) {
        expect(phrase.missingWord.template).toContain('______')
        expect(phrase.missingWord.options).toHaveLength(4)
        expect(new Set(phrase.missingWord.options).size).toBe(4)
      }
      if (phrase.correctEnding) {
        expect(phrase.correctEnding.stem.length).toBeGreaterThan(0)
        expect(phrase.correctEnding.options).toHaveLength(4)
        expect(new Set(phrase.correctEnding.options).size).toBe(4)
      }
      if (phrase.meaningMatch) {
        expect(phrase.meaningMatch.correctParaphrase.length).toBeGreaterThan(0)
        expect(phrase.meaningMatch.distractors).toHaveLength(3)
        expect(phrase.meaningMatch.distractors).not.toContain(phrase.meaningMatch.correctParaphrase)
      }
    }
  })
})

describe('getAdvancedPhrasesForLevel', () => {
  it('returns the requested count when enough phrases are fresh', () => {
    const phrases = getAdvancedPhrasesForLevel(3, new Set(), 1)
    expect(phrases).toHaveLength(3)
  })

  it('excludes phrases already shown this session, when enough fresh ones remain', () => {
    const used = new Set([ADVANCED_PHRASES[0]!.text])
    const phrases = getAdvancedPhrasesForLevel(5, used, 1)
    for (const p of phrases) expect(p.text).not.toBe(ADVANCED_PHRASES[0]!.text)
  })

  it('falls back to the full pool rather than under-filling when exclusion would leave too few', () => {
    const used = new Set(ADVANCED_PHRASES.map((p) => p.text))
    const phrases = getAdvancedPhrasesForLevel(3, used, 1)
    expect(phrases).toHaveLength(3)
  })

  it('is deterministic for a given seed', () => {
    const first = getAdvancedPhrasesForLevel(4, new Set(), 42)
    const second = getAdvancedPhrasesForLevel(4, new Set(), 42)
    expect(second).toEqual(first)
  })
})
